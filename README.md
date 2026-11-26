# Product Detail Page — React · TypeScript · Tailwind · Zustand + Immer

A pixel-accurate, responsive e-commerce product detail page (web **and** mobile designs), backed by the EasyOrders product API, with a persistent cart, variant selection with availability rules, reviews with faceted filters, and full keyboard / screen-reader support.

**Live demo:** https://product-detail-page-rho.vercel.app (deployed on Vercel)

> Design reference: the Figma file in the task README (`Product Details landing page / Web` 1512px and `/ Mobile` 375px frames).
> A detailed walkthrough of every decision (in Arabic) lives in [`docs/IMPLEMENTATION_GUIDE.md`](docs/IMPLEMENTATION_GUIDE.md).

---

## Quick start

Requirements: **Node 20.19+ / 22+**, npm 10+.

```bash
npm install
npm run dev          # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only (strict + `noUncheckedIndexedAccess`) |
| `npm run lint` | oxlint |
| `npm test` | Unit, component and integration tests (Vitest + Testing Library) |
| `npm run test:e2e` | Playwright E2E (desktop 1512px + Pixel 7) against the production build |

E2E uses the locally installed Google Chrome (`channel: 'chrome'`). Without Chrome run `npx playwright install chromium` and set `PW_CHANNEL=chromium`.

### Environment

All optional — see [`.env.example`](.env.example).

| Variable | Default |
| --- | --- |
| `VITE_API_BASE_URL` | `https://api.easy-orders.net/api/v1` |
| `VITE_STORE_SLUG` | `clear-theme` |
| `VITE_PRODUCT_SLUG` | `Sneakers12` |
| `VITE_CURRENCY` | `EGP` |
| `VITE_LOCALE` | `en-US` |

### Deployment

`npm run build` produces a static SPA in `dist/` — deploy to any static host (Vercel, Netlify, S3 + CloudFront, Nginx). Set the `VITE_*` variables at build time. Serve `index.html` for unknown routes if you add client-side routing.

---

## Architecture

```
src/
├── config/env.ts              runtime config (Vite env with defaults)
├── lib/                       framework-free helpers: http, format, htmlToText, cn
├── hooks/                     generic hooks (useCountdown, useDismiss)
├── components/
│   ├── ui/                    design-system primitives (Button, IconButton, Icon, Sheet,
│   │                          QuantityStepper, CountBadge, StarRating, Dashed*, Toaster, Skeleton)
│   └── layout/                AnnouncementBar, Header, Breadcrumbs, Footer, Logo
├── features/                  feature-first ("vertical slices")
│   ├── product/
│   │   ├── api/               DTO types → mapper → fetch function   (API boundary)
│   │   ├── model/             domain types + pure variant rules      (no React)
│   │   ├── hooks/             useProduct (React Query), useVariantSelection, useAddToCart
│   │   └── components/        ProductPage, gallery/, ProductInfo, VariationSelector, PurchasePanel…
│   ├── cart/                  Zustand + Immer + persist store, selectors, drawer UI, wishlist
│   ├── reviews/               fixture, pure filter/summary/pagination model, UI
│   └── recommendations/       fixture + ProductRail / ProductCard
└── test/                      setup, captured API fixture, factories
```

**Dependency rule:** `components/ui` and `lib` know nothing about features; features may use them; `model/` files are plain TypeScript so all business rules are unit-testable without rendering.

### Data flow

```
EasyOrders API ──fetch──▶ ProductDto ──mapProduct()──▶ Product (domain)
                                                         │
                           React Query cache ◀───────────┘  (staleTime 5m, retry 5xx only, abort + 10s timeout)
                                                         │
             useVariantSelection(product) ── pure rules in model/variants.ts
                       │  selection · variant · price · stock · maxQuantity (all derived)
                       ▼
             useAddToCart ── validate → snapshot → cartStore.addItem → feedback
                       ▼
             Zustand cart store (Immer drafts, persist → localStorage, validated on hydrate)
                       ▼
             CartButton badge · CartDrawer (lazy chunk) · cross-tab sync via `storage` event
```

### State management — what lives where

| State | Where | Why |
| --- | --- | --- |
| Product (server data) | **React Query** | caching, de-duplication, retries, cancellation, loading/error states |
| Cart, wishlist | **Zustand + Immer + persist** | global, shared by header/drawer/PDP, must survive reloads |
| Toasts | small Zustand store | imperative `toast()` callable from event handlers |
| Selected variant | component state (`useVariantSelection`) | belongs to this page view only |
| Review filters / page / votes | component state | nothing else needs them |
| Totals, counts, savings | **selectors** (derived, never stored) | one source of truth |

Cart store highlights:
- Lines keyed by `productId::variantId` → same variant merges, different variants stay separate.
- Quantities clamped to `[1, maxQuantity]` on every path (add, set, increment, hydration).
- `persist` with `partialize` (only `items`), `version` + `migrate`, and a validating `merge` that drops corrupt `localStorage` entries.
- `isOpen` / `notice` are UI state and deliberately not persisted.
- Components subscribe with narrow selectors (`useCartStore(selectItemCount)`) to avoid re-renders.

### API integration

`GET {VITE_API_BASE_URL}/products/slug/{store}/{slug}?join=reviews`

- The description is rendered as **plain text** (`lib/htmlToText.ts`, inert `DOMParser` + `textContent`) — no `dangerouslySetInnerHTML` anywhere, clamped to 4 lines with an inline "See More...." placed right after the last fitting word (`hooks/useTextClamp.ts`, binary search on a hidden twin).
- `lib/http.ts` — typed `HttpError`, `AbortSignal` from React Query combined with a 10s timeout (with fallbacks for older Safari/Firefox).
- `product.mapper.ts` normalizes the response: `0` means "not set" for prices; variant price inherits the product sale only when it inherits the product price; image de-duplication; variation kinds (`image` / `color` / `text`); stock is enforced only when `track_stock && disable_orders_for_no_stock`.
- Errors: 404 → "Product not found" (no retry); network/5xx → 2 retries with backoff, then a retry screen. A failed *background* refetch never replaces a loaded page.
- The endpoint returns **no reviews** and has **no related-products endpoint**, so those sections use typed fixtures behind `useProductReviews` / the rail props — replacing them with real calls touches one function each.

---

## Components (main props)

| Component | Props | Notes |
| --- | --- | --- |
| `ProductPage` | `slug` | Fetches and composes the page; loading skeleton / error / 404 states |
| `ProductGallery` | `product`, `preferredIndex` | Thumbnails, prev/next, hover-zoom (mouse), tap-zoom + swipe (touch), ←/→ keys, crossfade |
| `VariationSelector` | `variation`, `value`, `isAvailable(v)`, `onSelect(v)`, `error?`, `aside?`, `ref?` | WAI-ARIA radiogroup, roving tabindex, unavailable options crossed out |
| `PurchasePanel` | `product`, `selection` | Variations + CTAs + validation + stock notice (only when low/out) + sticky mobile buy bar. Each click adds one unit; quantity is edited in the cart drawer |
| `CountBadge` | `count`, `animationKey?` | Shared header counter (cart + wishlist), bump animation |
| `QuantityStepper` | `value`, `min?`, `max`, `onChange`, `label`, `size?`, `allowRemove?` | Native number input + buttons, clamped |
| `Sheet` | `open`, `onClose`, `title`, `side?`, `footer?` | Native `<dialog>` + `showModal()` (focus trap, ESC, top layer) |
| `CartDrawer` | — | Lazy-loaded; quantity edit, remove, totals, savings, empty state |
| `ProductReviews` | `productId` | Summary ring + bars, faceted filters (sidebar / mobile sheet), tabs, pagination, votes |
| `ProductRail` | `title`, `products`, `viewAllHref` | 2 / 3 / 5 column grid |

## Security

- No `dangerouslySetInnerHTML`; merchant HTML is reduced to text through an inert `DOMParser` document.
- Production build ships a strict Content-Security-Policy (`vite.config.ts`): `script-src 'self'`, API/CDN/font origins allow-listed, `object-src 'none'`. Prefer sending it as an HTTP header in production (adds `frame-ancestors`).
- Persisted cart/wishlist are versioned and validated on hydration; prices are display snapshots — checkout must re-price server-side.
- 5 runtime dependencies; `npm audit`: 0 vulnerabilities.

## Testing

- **Unit** — variant rules, mapper/pricing, cart store (merge, clamp, immutability, persistence, corrupt storage), review filtering/pagination, HTML → plain-text conversion (incl. XSS payloads).
- **Component** — `VariationSelector` keyboard + ARIA, `QuantityStepper` typing/clamping.
- **Integration** — the whole `App` with mocked `fetch`: validation → add → badge → drawer edits → empty state; 5xx retry and 404 paths.
- **E2E (Playwright)** — real browser, desktop + mobile: full cart flow incl. reload persistence, gallery ↔ swatch sync + keyboard, review filters (sidebar on desktop, sheet on mobile). The API is answered from a captured fixture for determinism.

## Requirements checklist

All README requirements are implemented. Bonus items done: wishlist (persisted), reviews display, recommendations, social share (Web Share API → clipboard fallback), keyboard navigation throughout. Not done: product comparison, analytics, PWA.
