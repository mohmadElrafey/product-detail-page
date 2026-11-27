# دليل التنفيذ — صفحة تفاصيل المنتج (Web + Mobile)

الملف ده بيشرح **إزاي** الصفحة اتبنت، و**ليه** كل قرار اتاخد، وإيه البدائل اللي اتقارنت. الهدف إنك تقدر تدافع عن كل جزء قدام أي Senior Frontend.

ترتيب الملف:

1. [إزاي الديزاين اتحوّل لكود (Pixel-perfect workflow)](#1-إزاي-الديزاين-اتحوّل-لكود)
2. [الـ Tech stack وليه كل اختيار](#2-الـ-tech-stack-وليه-كل-اختيار)
3. [الـ Folder structure وفلسفته](#3-الـ-folder-structure-وفلسفته)
4. [طبقة الداتا: API → DTO → Mapper → Domain](#4-طبقة-الداتا)
5. [منطق اختيار الـ Variant](#5-منطق-اختيار-الـ-variant)
6. [الـ State management بالتفصيل](#6-الـ-state-management)
7. [شرح كل Section في الصفحة](#7-شرح-كل-section-في-الصفحة)
8. [الـ Responsive strategy (Web / Tablet / Mobile)](#8-الـ-responsive-strategy)
9. [الـ Accessibility](#9-الـ-accessibility)
10. [الـ Performance](#10-الـ-performance)
11. [الـ Security](#11-الـ-security)
12. [الـ Testing strategy](#12-الـ-testing-strategy)
13. [الاختلافات المقصودة عن الديزاين وليه](#13-الاختلافات-المقصودة-عن-الديزاين)
14. [الـ Code review اللي اتعمل والمشاكل اللي اتصلحت](#14-الـ-code-review)
15. [الحدود الحالية والخطوات الجاية](#15-الحدود-الحالية-والخطوات-الجاية)
16. [أسئلة متوقعة في النقاش وإجاباتها](#16-أسئلة-متوقعة-في-النقاش)
17. [جولة التعديلات التانية + مراجعة الـ Skills](#17-جولة-التعديلات-التانية)
18. [التحقق من الـ Pixel perfect بالقياس](#18-التحقق-من-الـ-pixel-perfect-بالقياس)

---

## 1. إزاي الديزاين اتحوّل لكود

### المشكلة
ملف Figma ده **Community file**، وحساب Figma المربوط بالـ MCP مكانش ليه صلاحية Edit عليه، فمكانش ينفع أقرا منه القيم بالـ Dev Mode.

### الحل
1. اتعمل **Duplicate** للملف في الـ Drafts بحساب عنده صلاحية Edit.
2. في ملف عندك عليه Edit، الـ Figma web بيوفّر **Plugin API** (الـ `figma` global) في الـ console.
3. كتبت script بيمشي على الـ node tree لكل frame (Web 1512px و Mobile 375px)، وبيطلّع لكل layer:
   - الأبعاد والمكان: `x, y, width, height`.
   - **Auto-layout**: الاتجاه، `itemSpacing` (يعني الـ gap)، الـ padding، والـ alignment.
   - الـ fills والـ strokes بالـ hex، الـ `cornerRadius`، والـ effects.
   - النصوص: الخط، الوزن، الحجم، الـ line-height، الـ letter-spacing، والـ decoration زي strikethrough و underline.
   - الـ **dash pattern** للخطوط المتقطعة، وطلع إنه `[6, 6]`.
4. الأيقونات اتعملها export كـ **SVG** من نفس الـ API (`exportAsync({ format: 'SVG_STRING' })`)، والـ paths اتنقلت زي ما هي.

**النتيجة:** كل رقم في الكود (ألوان، مسافات، أحجام خطوط) **مقروء من الديزاين** مش متقدّر بالعين. مثلاً:

| العنصر | Desktop | Mobile |
| --- | --- | --- |
| عرض المحتوى | 1200px (156px margins على 1512) | 335px (20px padding) |
| المسافة بين الـ sections | 80px | 56px |
| الصورة الرئيسية | 458×610 rounded-8 | 279×372 rounded-8 |
| زراير الـ gallery | 52×52 rounded-8، gap 20 | 44×44 rounded-6 |
| الـ Thumbnails | 76×100، gap 20 | 55×73، gap 14.7 |
| عنوان المنتج | 36px Semibold، lh 120%، ls -0.5% | 23px |
| السعر الحالي / القديم | 28 / 18 | 20 / 14 |
| زرار Add To Cart | 296×58، rounded-8، 20px | 296×56، rounded-6، 18px |
| Option button (Size) | 75×40، border #E6E6E6 | grid 4 أعمدة |
| كارت المنتج | 212×284 image، gap 35 | 157×210، gap 21 |

### الـ Design tokens
كل الألوان اتحطت في `src/index.css` جوه `@theme` بتاع Tailwind v4 **بأسماء semantic** (`text-heading`، `border-option`، `bg-surface`…) مش بالـ hex. ليه؟
- لو الـ brand color اتغيّر بنغيّر سطر واحد.
- الكود بيقرا كأنه وصف للـ intent: `text-muted` أوضح من `text-[#8F8F8F]`.
- Tailwind v4 بيعمل الـ utilities أوتوماتيك من الـ CSS variables، فمفيش `tailwind.config.js`.

### الخطوط
- **Clash Grotesk**، الخط الأساسي في الديزاين. مجاني من Fontshare، واتحمّل بـ `<link>` مع `display=swap` و`preconnect`.
- **Raleway Bold**، مستخدم بس في كلمة "Description:" زي الديزاين بالظبط.

---

## 2. الـ Tech stack وليه كل اختيار

| الأداة | ليه | البديل اللي اترفض وليه |
| --- | --- | --- |
| **Vite 8** | dev server سريع جداً، build بـ Rolldown، و code-splitting تلقائي | **CRA** (اللي في الـ README): deprecated رسمياً من React team ومش بيتصان |
| **React 19** | `ref` بقى prop عادي (مفيش `forwardRef`)، وفيه `fetchPriority` على الصور | — |
| **TypeScript strict** + `noUncheckedIndexedAccess` | أي `array[i]` نوعه `T \| undefined`، فبيمنع crashes حقيقية | strict لوحده بيسيب الـ index access من غير حماية |
| **Tailwind v4** | مطلوب في التاسك، والـ tokens بقت CSS-first بـ `@theme` | CSS Modules: أبطأ في مطابقة الديزاين وبيكرر القيم |
| **Zustand + Immer** | مطلوب في التاسك. API صغير، مفيش Provider، و selectors بتقلل الـ re-renders | Redux Toolkit: boilerplate أكتر لحجم المشروع ده. Context: كل consumer بيعمل re-render |
| **TanStack Query v5** | الـ server state مختلف عن الـ client state: caching و retries و cancellation و loading/error | `useEffect + fetch`: race conditions ومفيش cache ولا retry |
| **`DOMParser`** (native) | الـ description جاي HTML من الـ merchant، وبنعرضه **نص بس**، فمحتاجين نطلّع منه النص بأمان | DOMPurify + `dangerouslySetInnerHTML`: كان مستخدم في الأول، واتشال في جولة الـ skills لأن عرض النص كـ text بيلغي سطح الـ XSS ومعاه الـ dependency (حوالي 13KB gzip) |
| **Vitest + Testing Library** | نفس config بتاع Vite وسريع، والـ RTL بيختبر زي اليوزر (roles و labels) | Jest: محتاج config منفصل للـ ESM و TS |
| **Playwright** | E2E على Chrome حقيقي (desktop و mobile) | Cypress: أتقل ومحدود في الـ multi-tab |
| **oxlint** | linter مكتوب بـ Rust، أسرع بكتير، وهو اللي جه مع الـ Vite template | — |

**ليه مفيش UI library** زي MUI أو shadcn؟ الديزاين custom بالكامل، وأي library كانت هتخليني أحارب الـ default styles. الـ primitives اللي محتاجها قليلة (Button, Sheet, Stepper…)، فكتابتها أنضف وأخف.

**ليه مفيش icon package**؟ الأيقونات ~25، اتعملها export من Figma بالـ stroke weights اللي الديزاينر اختارها (1.25 و1.5)، ومتجمّعة في component واحد بيستخدم `currentColor`. ده معناه zero requests إضافية وتطابق 100%.

---

## 3. الـ Folder structure وفلسفته

```
src/
├── config/            env + store settings
├── lib/               helpers مش معتمدة على React (http, format, htmlToText, cn, toast/)
├── hooks/             hooks عامة (useCountdown, useDismiss, useTextClamp)
├── components/
│   ├── ui/            primitives = design system صغير
│   └── layout/        Header, Footer, Breadcrumbs…
├── pages/             ProductPage: بتجمّع الـ features مع الـ layout
├── features/          ← القلب
│   ├── product/
│   │   ├── api/       dto + mapper + fetch   (حدود الـ API)
│   │   ├── model/     types + business rules (TypeScript صافي)
│   │   ├── hooks/     useProduct, useVariantSelection, useAddToCart
│   │   └── components/
│   ├── cart/          store + selectors + drawer
│   ├── reviews/       data/ + model/ + hooks/ + components/
│   └── recommendations/
└── test/              setup + fixtures
```

### ليه **feature-based** مش **type-based**؟
في الـ type-based (`components/` و`hooks/` و`store/`) الـ feature الواحدة بتتوزّع على 5 فولدرات. في الـ feature-based كل حاجة تخص الـ cart في مكان واحد: تقدر تمسحها أو تنقلها أو تديها لـ team تاني من غير ما تلمس باقي الكود.

### الـ Dependency rule
- الاتجاه: `pages → features → shared layers`، ومفيش حاجة بترجع لورا.
- `lib/` و`hooks/` و`components/` **ميعرفوش** أي feature، و`lib/` كمان مفيهوش React (حتى الـ toast store معمول بـ `zustand/vanilla`).
- الـ `Header` بياخد زرار الـ cart وعدد الـ wishlist كـ props من الصفحة، بدل ما يستوردهم من الـ features.
- `pages/` هي الوحيدة اللي بتجمّع أكتر من feature. الـ features بتستخدم الـ shared layers، مش العكس.
- `model/` **مفيهاش React خالص**، فكل الـ business rules بتتختبر بـ unit tests من غير render.

### ليه فصلت `api/` عن `model/`؟
عشان **Anti-Corruption Layer**: شكل الـ API (snake_case، `0` معناها "مش محدد"، فيه حوالي 40 flag ملهمش علاقة) **مش بيعدّي** للـ UI. لو الـ backend غيّر اسم field، بنعدّل الـ mapper بس.

---

## 4. طبقة الداتا

### الـ Endpoint
`GET {VITE_API_BASE_URL}/products/slug/clear-theme/Sneakers12?join=reviews`

### ملاحظات على الـ response الحقيقي (اتحلّل قبل الكتابة)
- `price: 190, sale_price: 160` على مستوى المنتج.
- **9 variants** (3 ألوان × 3 مقاسات)، وكلهم `price: 190, sale_price: 0, quantity: 0`.
- `track_stock: false`، يعني الـ quantity مش معناها "خلصان".
- الـ color variation نوعها `image`: كل لون ليه صورة.
- **مفيش reviews** في الـ response رغم `join=reviews`.
- **مفيش endpoint** للـ related products.

### الـ Mapper (`product.mapper.ts`): القرارات المهمة
1. **`0` = "not set"**: `sale_price: 0` معناها مفيش خصم، مش إن السعر صفر.
2. **سعر الـ variant**:
   - لو الـ variant **ورث** سعر المنتج (`price` = 0 أو نفس السعر)، يورث الخصم كمان. من غير القاعدة دي الخصم كان هيختفي أول ما اليوزر يختار مقاس، لأن كل الـ variants فيها `sale_price: 0`.
   - لو الـ variant ليه **سعر مختلف**، الخصم بتاعه هو بس اللي يتطبق. ده عشان ميتعملش **خصم وهمي**، زي إن 250 تتشطب ويظهر جنبها 160. المشكلة دي طلعت في الـ code review واتصلحت وعليها test.
3. **الـ Stock** بيتطبق بس لو `track_stock && disable_orders_for_no_stock`. لو الـ tracking شغال والـ disable مقفول، فده معناه إن الـ merchant سامح بالـ backorders.
4. **الصور**: صور المنتج والـ thumb وصور الألوان، مع **إزالة التكرار** وربط كل صورة لون بالـ `optionKey` بتاعها (`color:black`).
5. أسماء الـ options بتتعرض Title Case (`biege` تبقى `Biege`). الداتا نفسها فيها typo ومش بتتغيّر.

### React Query config (`useProduct.ts`)
```ts
queryOptions({
  queryKey: ['product', slug],
  queryFn: ({ signal }) => fetchProduct(slug, signal),
  staleTime: 5 * 60_000,
  retry: (count, error) => !(error instanceof HttpError && error.status < 500) && count < 2,
})
```
- **`staleTime` 5 دقايق**: داتا المنتج مش بتتغير كل ثانية، فمفيش داعي لـ refetch مع كل mount.
- **Retry ذكي**: الـ 404 مش هتتصلح لوحدها فمفيش retry، لكن الـ network أو 5xx ليهم retry مرتين بـ exponential backoff.
- **`signal`**: لو الكومبوننت اتشال، الـ request بيتلغى.
- **Timeout 10 ثواني** جوه `lib/http.ts`، ومعاه fallback للمتصفحات القديمة اللي مفيهاش `AbortSignal.any`.
- `refetchOnWindowFocus: false` على مستوى الـ client.

### حالات الـ UI
| الحالة | العرض |
| --- | --- |
| Loading | **Skeleton** بنفس أبعاد الـ layout الحقيقي، فمفيش layout shift |
| 404 | "Product not found" + لينك للهوم، من غير retry |
| Network/5xx | "We couldn’t load this product" + زرار Try again بيبقى "Retrying…" وهو شغال |
| داتا موجودة + refetch فشل في الخلفية | **الصفحة تفضل ظاهرة**، لأن الداتا ليها أولوية على الـ error |

---

## 5. منطق اختيار الـ Variant

الملف: `features/product/model/variants.ts`. كله **pure functions** والـ input بتاعها دايماً `(product, selection)`.

### الـ Selection
`{ color: 'brown', size: undefined }`، و`undefined` معناها لسه متختارش.

### الـ Functions الأساسية
| Function | بتعمل إيه |
| --- | --- |
| `getInitialSelection` | بتختار أول لون **متاح** مسبقاً عشان الصورة والـ label يبقى ليهم قيمة، و**بتسيب المقاس فاضي**: اليوزر لازم يختار، والـ validation بتجبره |
| `findVariant` | الـ variant المطابق لما الـ selection يكمل |
| `isOptionAvailable` | هل الـ option ده ينفع يتختار **مع باقي الاختيارات الحالية**؟ |
| `applySelection` | بتطبق الاختيار، و**بتلغي أي اختيار تاني بقى مستحيل** |
| `getStock` / `getMaxQuantity` | حالة المخزون والحد الأقصى للكمية (أقل قيمة بين الـ stock و10) |
| `getImageIndexForSelection` | صورة اللون المختار في الـ gallery |

### خوارزمية الـ Availability (مهمة في النقاش)
```
option متاح ⇔ فيه variant واحد على الأقل:
   - فيه القيمة دي للـ variation دي
   - ومتوافق مع باقي الاختيارات الحالية
   - وقابل للشراء (stock > 0 أو مفيش stock tracking)
```
مثال: لو `black/42` خلصان واليوزر اختار Black، المقاس 42 يتقفل. ولو اختار 42 الأول، اللون Black هو اللي يتقفل.
- **Complexity**: O(variants × variations) لكل option. مع 9 variants ده لا شيء، ومع آلاف الـ variants ممكن نبني index.

### ليه `applySelection` بيلغي الاختيارات المستحيلة؟
عشان الـ UI **ميوصلش أبداً** لحالة combination مش قابلة للشراء. مثلاً: لو مختار `brown/42` وغيّرت لـ Black وblack/42 خلصان، المقاس يتمسح واليوزر يختار من جديد بدل ما يضغط Add وياخد error.

### ليه الـ selection في **local state** مش في Zustand؟
- الاختيار ده بيخص **الصفحة دي بس**. لو اتحط في global store، هيفضل موجود لما تفتح منتج تاني.
- الـ global store بيعمل re-render لأي subscriber، والـ selection بيتغير كتير.
- **كل حاجة تانية derived** جوه `useMemo`: الـ variant والسعر والمخزون والـ max. مفيش قيمة متخزنة مرتين.

---

## 6. الـ State management

### القاعدة: كل نوع state في مكانه
| النوع | المكان | السبب |
| --- | --- | --- |
| **Server state** (المنتج) | React Query | cache و retry و cancel و loading |
| **Global client state** (Cart و Wishlist) | Zustand | محتاجينه في الـ Header والـ Drawer والـ PDP، ولازم يفضل بعد الـ reload |
| **Local UI state** (Selection و Quantity و Review filters) | `useState` | ميخصش حد تاني |
| **Derived** (Total و Count و Savings) | Selectors | **مش متخزن**، عشان ميحصلش drift |

### الـ Cart store (`features/cart/store/cart.store.ts`)
```ts
create<CartStore>()(
  devtools(
    persist(
      immer((set, get) => ({ ...state, ...actions })),
      { name, version, storage, partialize, merge, migrate },
    ),
  ),
)
```

**ترتيب الـ middlewares** مهم: `immer` جوه `persist`، و`persist` جوه `devtools`.
- **immer** بيخلّي الـ actions تكتب `line.quantity = 3`، و Immer بيطلّع state جديد immutable، وفيه test بيتأكد إن الـ reference بيتغير.
- **persist** بيحفظ في `localStorage`.
- **devtools** في الـ dev بس.

### تفاصيل الـ Cart line
- **`lineId = productId::variantId`**: لو ضفت نفس الـ variant تاني الكمية بتتجمع في نفس السطر، ولو variant مختلف بيعمل سطر جديد.
- السطر **snapshot** فيه الاسم والصورة والسعر والـ options، فالـ drawer بيتعرض فوراً من الـ localStorage من غير ما نعيد fetch لكل منتج. الـ checkout الحقيقي لازم يعمل re-validate للأسعار على السيرفر.
- **الكمية محصورة بين `1` و`maxQuantity`** في **كل** مسار: add و set و increment ولما الداتا بترجع من الـ storage. والـ `addItem` بيرجّع `{ added, clamped }` عشان الـ UI يقول لليوزر لو الكمية اتقصّت.

### الـ Persist بالتفصيل
| Option | الاستخدام |
| --- | --- |
| `partialize` | بيحفظ `items` بس. أما `isOpen` و`notice` فهما UI state، ولو اتحفظوا الـ drawer هيفتح لوحده بعد الـ reload |
| `version: 1` + `migrate` | لو شكل الـ state اتغير بعدين، نكتب migration بدل ما نكسر carts اليوزرز |
| `merge` (validation) | الـ `localStorage` **في إيد اليوزر**، يعني ممكن يبقى corrupt أو متعدّل. كل item بيعدّي على `isCartItem` (runtime type guard) والـ invalid بيتشال، والكمية بتتحصر في الـ max |

### Cross-tab sync
`syncCartAcrossTabs()` بيسمع لـ `storage` event: لو فاتح الصفحة في تابين وضفت من واحد، التاني بيعمل `rehydrate()`.

### الـ Selectors وتقليل الـ re-renders
```ts
const count = useCartStore(selectItemCount)
```
الـ `CartButton` بيعمل subscribe على **العدد بس**، فلو سعر snapshot اتغير مش هيعمل re-render. والـ `CartLine` عامل `memo`، فتغيير كمية سطر بيعمل re-render للسطر ده بس.

---

## 7. شرح كل Section في الصفحة

### 7.1 Announcement bar
- خلفية `#141414`، ارتفاع 42px على الـ desktop، و58px سطرين على الموبايل.
- الـ pill بتاعة الوقت `inline` في آخر النص، فعلى الموبايل بتنزل طبيعي في آخر السطر التاني زي الديزاين بالظبط. أول تنفيذ كان flex والـ pill كانت بتنزل لوحدها في سطر، واتصلح بعد المقارنة البصرية.
- **العداد حقيقي**: الوقت الفاضل لحد نص الليل. الـ API فيه `fake_timer_hours`، لكن **countdown وهمي بيرجع يبدأ من الأول = dark pattern**، فاتعمد عداد لـ deadline حقيقية.

### 7.2 Header
- Desktop: Logo، وعلى اليمين Search ← Categories ← Sign in ← Wishlist ← Cart، بمسافات 32px و42px من Figma.
- Mobile: Search و Cart و Menu (hamburger) بيفتح **Sheet** من الشمال.
- **Categories dropdown** بيتملا من `product.categories` اللي جاية من الـ API نفسه، وبيقفل بـ click برّه أو Escape (`useDismiss`)، والفوكس بيرجع للزرار.
- الـ **Cart badge** دايرة 13px (من Figma)، و`key={lastAddedAt}` بيعمل remount للـ badge عشان animation الـ "bump" تشتغل مع كل إضافة. ده animation بـ CSS بس من غير state إضافي.
- **Wishlist badge**: القلب في الـ header بيعرض عدد المنتجات المحفوظة. الـ badge نفسه component مشترك اسمه `CountBadge` بيستخدمه الـ cart والـ wishlist (DRY). في الموبايل القلب مش في الـ header حسب الديزاين، فالعدد بيظهر جنب "Wishlist" في الـ menu.
- **المسافات الرأسية** في الـ header اتقللت بطلب العميل: من 31px لـ 22px على الـ desktop، ومن 24px لـ 16px على الموبايل، فوق الـ logo وتحت الخط المتقطع.
- الخط المتقطع تحت الـ header: `dashed-rule` (شوف 7.13).

### 7.3 Breadcrumbs
- `nav > ol` مع `aria-current="page"` على العنصر الأخير.
- على الموبايل اسم المنتج بينزل سطر لوحده (`w-full`) زي الـ mobile frame.
- الـ category جاية من الـ API.

### 7.4 Gallery (`gallery/ProductGallery.tsx` + `ZoomableImage.tsx`)
**الـ Layout**: CSS Grid `[image | actions]` والـ thumbnails تحت.
- Desktop: الـ thumbnails تحت الصورة بس (عرض 461 = عرض الصورة).
- Mobile: الـ thumbnails بتاخد العرض كله (`col-span-2`).
- الـ thumbnails عبارة عن grid بـ `auto-cols-[calc((100%-4*gap)/5)]`: 5 ظاهرين، ولو الصور أكتر بيبقى فيه scroll أفقي بـ snap.

**الـ Zoom**:
- **Mouse**: zoom عند الـ hover، والـ `transform-origin` بيتبع الماوس، يعني الجزء اللي تحت الماوس هو اللي بيتكبّر.
- **Touch**: tap بيعمل zoom عند نقطة الـ tap، والـ **swipe** الأفقي بيقلّب الصور، بس لما مفيش zoom. ده عشان ميحصلش تعارض بين الـ pan والـ swipe.
- بنستخدم `transform` و`opacity` بس، دول بيتنفذوا على الـ compositor، فالأداء 60fps ومفيش layout.
- `key={src}` على الـ component كله، فتغيير الصورة بيعمل **reset للـ zoom** (finding من الـ code review)، وكمان بيشغّل الـ fade-in فيبان كـ crossfade.

**المزامنة مع اختيار اللون**: لما تختار Black الـ gallery بتروح لصورة Black. اتعملت بـ **"adjusting state during render"**، وده الـ pattern اللي React بيرشحه بدل `useEffect`:
```ts
if (preferredIndex !== lastPreferred) {
  setLastPreferred(preferredIndex)
  if (preferredIndex >= 0) setActiveIndex(preferredIndex)
}
```
ليه مش `useEffect`؟ الـ effect بيشتغل **بعد** الـ paint، فكان هيبان frame فيه الصورة القديمة (flash). كمان فيه re-render زيادة.

**صور الـ API خلفيتها بيضا**، والديزاين فيه "well" رمادي `#F2F2F2`. الحل: `object-contain` مع `mix-blend-multiply`، فالأبيض × الرمادي = رمادي والصورة بتندمج في الخلفية. ده سطر CSS واحد من غير ما نعدّل الصور.

**الـ Accessibility**: `aria-roledescription="carousel"`، والصورة الرئيسية focusable ومعاها ←/→، والـ thumbnails عليها `aria-current`، والـ icon buttons ليها labels.

**Share**: `navigator.share` (native share sheet على الموبايل)، ولو مش موجود بيعمل copy للينك + toast.
**Wishlist**: toggle محفوظ في store بـ persist، والقلب بيتملي لما المنتج يتحفظ، و`aria-pressed` بيقول الحالة.

### 7.5 Product info
- Brand، ثم `h1` (العنوان الوحيد h1 في الصفحة)، ثم صف السعر و Sold والتقييم بـ `justify-between`.
- **PriceTag**: `line-through` للسعر القديم. وفيه `sr-only` "Original price / Sale price"، عشان قارئ الشاشة ميقولش رقمين ورا بعض من غير معنى.
- **السعر بيتغير مع الـ variant** لأن `selection.price` derived من الـ variant المختار.
- **التقييم في الـ header = متوسط الـ reviews الحقيقي** المعروضة تحت. أول تنفيذ كان رقم منفصل، واتغيّر عشان الأرقام تبقى consistent.
- الرقمين عاملين لينك لـ `#reviews`.
- **عملة الأسعار**: `Intl.NumberFormat`، والأرقام الصحيحة من غير `.00` (`EGP 160`). ده كمان خلّى صف السعر يفضل سطر واحد على 375px.

### 7.6 Description
- **نص عادي مش bullet points** (بطلب العميل وزي الديزاين). `lib/htmlToText.ts` بيحوّل الـ HTML لفقرة واحدة:
  - بيستخدم `DOMParser`، وده بيعمل document **inert**: الـ scripts مش بتشتغل والصور مش بتحمّل، وإحنا بنقرا `textContent` بس.
  - بياخد الـ **leaf blocks** بس (`p` و`li` و`h*`) عشان النص ميتكررش لو `li` جواه `p`، وبيوحّد المسافات (`&nbsp;`)، وبيشيل الـ paragraphs الفاضية، وبيحط نقطة في آخر كل عنصر مش منتهي بعلامة ترقيم.
  - النتيجة بتتعرض كـ text node عادي، يعني **مفيش `dangerouslySetInnerHTML` خالص**.
- **"See More...." لازقة في آخر كلمة** (بطلب العميل). `line-clamp` مش بيقدر يحط عنصر inline بعد آخر كلمة ظاهرة، فاتعمل hook اسمه `useTextClamp`:
  - فيه **twin مخفي** (`invisible absolute`) بنفس العرض والخط بيتعمله قياس.
  - **Binary search** على عدد الحروف اللي تكفي في 4 سطور ومعاها "… See More....". ده O(log n) قياس، تقريباً 10 قياسات بدل قياس لكل حرف.
  - القص بيرجع لأقرب **حدود كلمة**، فمفيش كلمة مقطوعة.
  - بيعيد القياس مع تغيّر العرض (`ResizeObserver`) ولما الخطوط تخلص تحميل (`document.fonts.ready`)، لأن مقاسات الخط بتتغير.
  - الزرار بيظهر **بس لو النص أطول فعلاً**، ومعاه `aria-expanded` و`aria-controls`. لما تفتحه بيبقى "See Less" في نفس المكان.
- **المسافة بين الـ Description والـ Color** اتقللت بطلب العميل: من 40px لـ 28px على الـ desktop، ومن 32px لـ 24px على الموبايل.

### 7.7 Variations (`VariationSelector.tsx`)
**Pattern: WAI-ARIA Radio Group + Roving tabindex**
- `role="radiogroup"` مربوط بالـ label (`aria-labelledby`)، وكل option `role="radio"` مع `aria-checked`.
- **Tab** بيدخل الـ group **مرة واحدة** على الـ option المختار، والأسهم بتحرك وتختار في نفس الوقت (ده سلوك الـ radio الطبيعي)، و Home/End بيروحوا للأول والآخر.
- الـ options **غير المتاحة**:
  - `aria-disabled` بدل `disabled`، عشان تفضل مسموعة لقارئ الشاشة كـ "(unavailable)".
  - الأسهم بتتخطاها.
  - شكلها opacity 40% وعليها خط مايل.
- لو الفوكس كان على option مش متاح (ممكن يحصل بالـ click)، الأسهم بتحسب الجار **بالـ index**. ده finding من الـ review.

**الأشكال (من Figma)**:
- **Image swatch** (اللون): 75×40. لما يبقى مختار: خلفية بيضا وborder 1px `#141414` والصورة جوا بـ inset 6px. على الموبايل الأرقام 73.7×39.3 وinset 5.9، فاتعمل grid 4 أعمدة بنفس النسبة.
- **Text option** (المقاس): border `#E6E6E6`. لما يبقى مختار: خلفية `#EBEBEB` وborder `#333`.
- الـ component **generic**: بيدعم `image` و`color` (hex) و`text`، فلو منتج تاني جه بـ variation نوعها color هيشتغل من غير تعديل.

**الـ Validation**: لو ضغطت Add من غير مقاس، يحصل الآتي:
1. يظهر `Please select a size` بـ `role="alert"`، يعني قارئ الشاشة بيقولها فوراً.
2. الـ group ياخد `aria-invalid` و`aria-describedby` بيشاور على الـ error.
3. **Scroll للـ group + focus على أول option متاح**.

### 7.8 Quantity
- **اتشالت من صفحة المنتج بطلب العميل** عشان الصفحة ترجع مطابقة للديزاين. كل ضغطة Add To Cart بتضيف وحدة واحدة، ونفس الـ variant بيتجمع في نفس السطر.
- **متطلب الـ README** (Quantity selector with min/max) لسه متحقق، بس **في الـ cart drawer**. هناك `QuantityStepper`:
  - **native `<input type="number">`** بين زرار − وزرار +، فبيعلن نفسه spinbutton لقارئ الشاشة والأسهم شغالة.
  - اليوزر يقدر **يمسح الرقم ويكتب رقم جديد**: فيه draft state، والـ commit بيحصل على blur أو Enter.
  - الكمية محصورة بين 1 والحد الأقصى، والـ − عند 1 بتشيل السطر.
- **Stock indicator**: بيظهر **بس لما يكون مهم**، يعني "Only N left" أو "Out of stock" تحت الزراير. المنتج الحالي مش بيعمل stock tracking، فمش بيظهر خالص والتصميم يفضل نضيف.

### 7.9 CTA (Add To Cart / Checkout Now)
- `useAddToCart` hook فيه كل الـ flow: **validate ← snapshot ← store ← feedback**. الزرار الرئيسي وزرار الـ sticky bar بيستخدموا **نفس الكود**.
- **Feedback**:
  - الزرار بيبقى "✓ Added" لمدة 1.8 ثانية، بس لو اتضاف فعلاً حاجة.
  - **Toast** فيه "View cart".
  - الـ badge بيعمل bump.
  - لو الكمية اتقصت بسبب الحد الأقصى، بتظهر رسالة صريحة.
- **Checkout Now**: بيضيف ويفتح الـ drawer، ولو حصل clamp الرسالة بتظهر **جوه الـ drawer**.
- عرض الزراير: على الـ desktop `flex-[296]` و`flex-[200]` بنسبة الديزاين، وعلى الموبايل 296 و187 فوق بعض زي الـ mobile frame.

### 7.10 Sticky buy bar (موبايل)
- مفعّل بـ flag من الـ API: `is_fixed_bottom_buy: true`.
- **IntersectionObserver** على الـ CTA، مش scroll listener. الـ bar بيظهر **بس بعد ما الـ CTA يعدّي فوق الشاشة**، مش قبل ما توصله.
- `lg:hidden`.

### 7.11 Cart drawer
- **Native `<dialog>` + `showModal()`**، وده من أهم القرارات. المتصفح بيدي ببلاش:
  - **Focus trap** وكل الصفحة اللي ورا بتبقى `inert`.
  - **ESC** بيقفل، وبنعترض `cancel` ونمشّيه على الـ state بتاعنا عشان React يفضل هو مصدر الحقيقة.
  - **Top layer**: مفيش مشاكل z-index.
  - **Focus restoration**: الفوكس بيرجع للزرار اللي فتح الـ drawer.
  - الإضافات اللي عملتها: body scroll-lock، والقفل بالضغط على الـ backdrop (`event.target === dialog`).
- **Lazy-loaded**: الـ chunk بتاعه بيتحمّل أول مرة يفتح، وبعدها بيفضل mounted.
- المحتوى بيترسم **بس والـ Sheet مفتوح**، عشان ميبقاش فيه controls مكررة مخفية في الـ DOM (اتكشف في الـ E2E).
- جواه: الصورة، الاسم، الـ options، stepper (الـ − عند 1 بيشيل السطر)، زرار حذف، السعر القديم والجديد × الكمية، Subtotal، You save، و **Empty state** فيه "Continue shopping".
- **ملاحظة تقنية**: أي حاجة برّه الـ modal dialog بتبقى inert ومتغطية بالـ backdrop، فالـ toast مش هيبان والـ drawer مفتوح. عشان كده رسايل الـ drawer (clamp و checkout) **بتترسم جواه** في `role="status"` (finding من الـ review).

### 7.12 Reviews
- **مصدر الداتا**: الـ API مرجّعش reviews، فاتعمل fixture من 12 review **typed**، بيعدّي على hook اسمه `useProductReviews`. لما يبقى فيه endpoint، بنغيّر الـ hook بس.
- **Summary** (كله **محسوب** من الداتا مش ثابت):
  - **Rating ring**: SVG circle و`stroke-dasharray` = `average/5` من المحيط. الـ stroke اتقلّ بطلب العميل من 10% لـ **6%** من القطر، وده ثابت واحد اسمه `strokeWidth`، والـ radius بيتحسب منه.
  - **Bars**: عرض كل bar نسبة من أكبر count، وعليها `role="meter"` مع القيم.
  - على الموبايل الـ bars **من غير radius** زي الديزاين، وعلى الـ desktop rounded-8.
- **Filters**:
  - **Faceted search**: **OR** جوه نفس الـ group (4 أو 3 نجوم)، و**AND** بين الـ groups (تقييم + topic).
  - Native checkboxes مخفية بـ `opacity-0` فوق مربع مرسوم بنفس "tick-square" بتاع Figma. الكيبورد وقارئ الشاشة شغالين ببلاش.
  - الـ groups قابلة للطي (`aria-expanded`).
  - **Desktop**: sidebar عرضه 278px. **Mobile**: زرار filter عليه badge بعدد الفلاتر بيفتح bottom Sheet، وده بالظبط اللي في الـ mobile frame.
- **Tabs**: All و With Photo & Video و With Description، وهي buttons بـ `aria-pressed` لأنها toggles مش tabs بمعنى ARIA.
- **Pagination**:
  - `getPageList` بيطلّع `[1, 2, '…', 19]` زي الديزاين.
  - أي تغيير في الفلتر بيرجّع لصفحة 1.
  - تغيير الصفحة بيعمل scroll لأول الليست.
  - `aria-current="page"`.
- **Helpful votes**: toggle، والـ like المختار بيتملي (أخضر على الموبايل وأسود على الـ desktop زي الفريمين).
- **Live region**: "N reviews match" بيتقال بعد الفلترة.
- كل المنطق (summarize و filter و paginate و getPageList) **pure functions** وعليها tests.
- الـ section كلها **lazy chunk**، لأنها تحت الـ fold.

### 7.13 الخطوط والصناديق المتقطعة (تفصيلة pixel-perfect)
Figma بيستخدم dash pattern `[6, 6]` بسمك 0.5px. CSS `border-style: dashed` **مش بيتحكم في طول الشرطة**، فاتعمل الآتي:
- **الخطوط**: `background-image: linear-gradient(to right, color 50%, transparent 50%)` مع `background-size: 12px` (6 مرسوم + 6 فاضي). وعلى شاشات `2dppx` السمك 0.5px.
- **الصناديق** (review summary و filter): **SVG `<rect>` absolute** فيه `stroke-dasharray="6 6"` و`rx=8`، وبيتمدد مع الصندوق.

### 7.14 Related / Popular rails
- Grid بـ **2 أعمدة على الموبايل** (3 صفوف)، و**3 على التابلت**، و**5 على الـ desktop** (5×212 + 4×35 = 1200 بالظبط). الكارت السادس مخفي على الـ desktop (`nth-child(n+6)`) لأن الديزاين فيه صف واحد.
- الكارت كله **لينك واحد** بـ pseudo-element `after:inset-0`: tab stop واحد للكارت بدل 3، والـ hover بيكبّر الصورة.
- الصور `loading="lazy"` وليها `width` و`height`، فمفيش CLS.
- الداتا fixture بصور حقيقية من نفس الـ CDN بتاع المتجر.

### 7.15 Footer
- Newsletter بـ validation native (`type="email" required`) و toast نجاح.
- Social links ليها `aria-label`.
- 3 columns: على الـ desktop flex بمسافة 120، وعلى الموبايل grid عمودين.
- خط dashed، وتحته copyright وselectors.

---

## 8. الـ Responsive strategy

- **Mobile-first**: الـ base classes = الـ mobile frame، و`md:` و`lg:` بيضيفوا. ده معناه إن الموبايل (أغلب زوار e-commerce) مش بيحمّل override styles.
- **Breakpoints**:
  | Range | Layout |
  | --- | --- |
  | < 768 | Mobile frame بالحرف |
  | 768–1023 (`md`) | **Tablet**: عمودين (gallery و info)، الـ gallery **sticky**، والـ rails 3 أعمدة |
  | ≥ 1024 (`lg`) | Desktop frame |
- **Desktop columns** `grid-cols-[minmax(0,545px)_minmax(0,520px)] justify-between`: على 1200px بيطلع بالظبط 545 + 135 + 520، وعلى desktop أصغر (1024) العمودين بيصغروا بالنسبة بدل ما يحصل overflow.
- **Touch targets** على الموبايل 44px على الأقل، والأرقام دي أصلاً من الديزاين (44×44 icon buttons).
- **Touch interactions**: swipe في الـ gallery، و tap-to-zoom بدل hover، و bottom sheets.
- اتعملت **مقارنة بصرية** بـ screenshots من headless Chrome على 1512 و375 قدام الـ Figma export، واتصلح:
  1. مكان الـ timer pill.
  2. عرض الـ stepper.
  3. خلفية الصور (multiply).
  4. wrap صف السعر.
  5. عرض الـ drawer.

---

## 9. الـ Accessibility

| النقطة | التنفيذ |
| --- | --- |
| Landmarks | `header` و`nav` (Main و Breadcrumb و Footer columns) و`main#main` و`footer` و`aside` (promo) |
| Skip link | "Skip to content" بيظهر مع الـ focus |
| Headings | `h1` واحد (اسم المنتج)، `h2` للـ sections، `h3` للـ items |
| Variations | Radio group + roving tabindex + `aria-disabled` للـ unavailable |
| Validation | `role="alert"` + `aria-invalid` + `aria-describedby` + نقل الـ focus |
| Live regions | الـ Toasts (`role="status"`)، عدد نتايج الـ reviews، ورسايل الـ drawer |
| Dialogs | `<dialog>` native: focus trap و ESC و focus restore و `aria-labelledby` |
| Icon buttons | كلها ليها `aria-label`، و`IconButton` **بيجبر** prop اسمه `label` على مستوى الـ type |
| Images | `alt` وصفي للصور المهمة، و`alt=""` للصور الزخرفية والـ thumbnails اللي الزرار بتاعها عليه label |
| Prices | نصوص `sr-only` "Original price / Sale price" |
| Motion | `prefers-reduced-motion` بيقفل الـ animations |
| Focus | `:focus-visible` outline واضح على كل حاجة |

---

## 10. الـ Performance

| التقنية | التأثير |
| --- | --- |
| **Code splitting** | الـ Reviews (12KB) والـ CartDrawer (3.7KB) chunks منفصلة بـ `React.lazy` |
| **Main bundle** | **~107KB gzip** (كان 120KB قبل ما DOMPurify يتشال): React 19 ~60، وReact Query، وZustand/Immer |
| **`content-visibility: auto`** | الـ reviews والـ rails (تحت الـ fold) واخدين utility اسمها `defer-render`، فالمتصفح مش بيعمل layout ولا paint ليهم غير لما يقربوا من الشاشة (قاعدة `rendering-content-visibility`) |
| **Static JSX مرفوع** | لينك الـ size chart متعرّف مرة واحدة برّه الـ component (`rendering-hoist-jsx`) |
| **صورة الـ LCP** | `fetchPriority="high"`، وباقي الصور `loading="lazy"` + `decoding="async"` |
| **No CLS** | `width` و`height` و`aspect-ratio` على كل الصور، والـ Skeleton بنفس الـ layout |
| **Preconnect** | للـ API والـ image CDN والـ fonts في `index.html` |
| **Font display** | `swap` |
| **Re-renders** | Zustand selectors ضيقة، و`memo` على `CartLine` و`ProductCard` و`ReviewItem`، و`useMemo` للـ derived state |
| **Animations** | `transform` و`opacity` بس (compositor) |
| **Observers** | `IntersectionObserver` للـ sticky bar، و`ResizeObserver` للـ description، بدل scroll و resize listeners |
| **API caching** | React Query بـ `staleTime` 5 دقايق، و de-duplication |

**ليه مفيش `useMemo`/`useCallback` في كل حتة؟** الـ memoization ليها تكلفة. اتحطت بس في الأماكن اللي فيها حساب حقيقي أو props رايحة لـ `memo` components.

---

## 11. الـ Security

- **XSS**: الـ description HTML جاي من طرف تالت (merchant).
  - بنعرضه **كنص بس**: `DOMParser` (inert، مفيش scripts ولا تحميل صور) ثم `textContent`، و**مفيش `dangerouslySetInnerHTML` في المشروع كله**. ده أقوى من أي sanitizer، لأن مفيش HTML بيتحقن أصلاً.
  - عليه tests بـ payloads زي `<script>` و`onclick` و`onerror`.
- **Content-Security-Policy** على الـ production build (Vite plugin في `vite.config.ts`):
  - `script-src 'self'`.
  - `connect-src` للـ API بس، و`img-src` للـ CDN بس، والخطوط من مصدرين محددين.
  - `object-src 'none'` و`base-uri 'self'` و`form-action 'self'`.
  - الـ E2E بيشتغل على الـ build نفسه، فأي مخالفة كانت هتكسر الـ tests. وتأكدت يدوياً إن مفيش CSP violations في الـ console.
  - في الـ production الأحسن يتبعت كـ HTTP header، عشان كمان يدعم `frame-ancestors` ضد الـ clickjacking.
- **Secret scan**: `secret_scanner.py` (من senior-security skill) على `src/` طلّع **0 findings**.
- **localStorage tampering**: الـ cart بيتعمله validate بـ runtime type guard عند الـ hydration، وأي item مش سليم بيتشال.
- **أسعار الـ cart**: snapshot للعرض بس. الـ checkout الحقيقي **لازم** يحسب السعر على السيرفر من الـ variant id.
- **URLs**: `encodeURIComponent` على الـ slug والـ store في الـ API URL.
- **Fake urgency**: مفيش countdown وهمي (نقطة UX ethics).

---

## 12. الـ Testing strategy

**54 unit/component/integration test + 6 E2E** (3 سيناريوهات × desktop و mobile).

| الطبقة | الملفات | بيختبر إيه |
| --- | --- | --- |
| **Unit (pure)** | `variants.test.ts` | initial selection، والـ missing، و findVariant، ووراثة الخصم، والـ availability مع stock tracking، والـ clearing، والـ low stock والـ max |
| | `product.mapper.test.ts` | resolveMoney، ومنع الخصم الوهمي، وإزالة تكرار الصور، والـ stock flags |
| | `cart.store.test.ts` | add و merge و lines منفصلة و clamp، والحذف عند 0، و**Immer immutability**، والـ selectors، والـ **persist partialize**، و**corrupt storage**، والـ clamp عند الـ hydration |
| | `reviews.test.ts` | summary، والـ faceted filter (OR و AND)، والـ tabs، والـ pagination، والـ page list |
| | `htmlToText.test.ts` | تحويل القوايم لجمل، و`&nbsp;`، والـ paragraphs الفاضية، والـ nested blocks، وXSS payloads |
| **Component** | `VariationSelector.test.tsx` | ARIA roles، والكيبورد، والـ roving tabindex، والـ unavailable، والـ error description |
| | `QuantityStepper.test.tsx` | مسح وكتابة رقم، والـ clamp، والـ min و max |
| **Integration** | `App.test.tsx` | الـ App كله مع `fetch` mocked: validation ← add ← badge ← drawer ← empty state، و**retry الـ 5xx مرتين**، و**404 من غير retry** |
| **E2E** | `e2e/product-page.spec.ts` | Chrome حقيقي: الـ flow كامل لحد الـ **reload persistence**، والـ gallery مع اللون والكيبورد، والـ review filters (sidebar على الـ desktop و sheet على الموبايل) |

**فلسفة الـ tests**:
- Testing Library بيختبر **زي اليوزر**: بالـ roles والـ labels مش بالـ classes. لو الـ a11y اتكسر الـ test بيفشل، فالـ tests بتحرس الـ accessibility كمان.
- الـ E2E بيستخدم **fixture حقيقي متسجّل من الـ API** مع `page.route`، فهو deterministic ومش معتمد على API خارجي ممكن يقع.

---

## 13. الاختلافات المقصودة عن الديزاين

| الديزاين | التنفيذ | السبب |
| --- | --- | --- |
| لوجو John Lewis ومنتجات John Lewis | Wordmark "ACHILLES & SHOES" بنفس المقاس والـ tracking، وداتا المتجر الحقيقية | **مينفعش نستخدم براند شركة حقيقية**، والـ API أصلاً بتاع متجر أحذية |
| مفيش Quantity | مفيش Quantity في الصفحة، والكمية بتتعدل في الـ cart drawer. والـ stock بيظهر بس لو قليل أو خلصان | بطلب العميل عشان الصفحة تطابق الديزاين، ومتطلب الـ README لسه متحقق في الـ drawer |
| الأسعار بـ £ و $ | `EGP` من `src/config/store.ts` | المتجر في مصر، والعملة بتتغير من ملف الإعدادات |
| Swatches ألوان صافية | Swatches بصورة كل لون | الـ API بيدي `type: "image"` لكل لون، يعني ده الـ intent |
| 6 مقاسات | 3 مقاسات | دي الداتا الحقيقية، والـ component بيدعم أي عدد |
| Reviews بأرقام 2823 و 1.25k | أرقام محسوبة من الـ fixture | الأرقام في الديزاين placeholder، والمحسوب أصدق |
| ~~Countdown ثابت~~ | عداد حقيقي لنص الليل | تجنب الـ fake urgency |
| "View Size Chart" مش ظاهرة على الموبايل | نفس الشيء | في الـ mobile frame النص واقع برّه حدود الـ frame |

---

## 14. الـ Code review

بعد ما التنفيذ خلص اتعمل **code review**، وطلع 10 findings واتصلحوا كلهم مع **regression tests**:

1. **Error بيغطي على الداتا**: refetch فاشل في الخلفية كان بيقلب الصفحة error ويضيّع اختيارات اليوزر. اتصلح بإن الـ render بقى يدّي الداتا أولوية: `product ? Loaded : error ? Error : Skeleton`.
2. **خصم وهمي**: variant بسعر مختلف كان بياخد sale المنتج. اتصلح (القاعدة في القسم 4).
3. **Toast مخفي ورا الـ modal**: نقلنا رسايل الـ drawer جواه.
4. **`AbortSignal.any`** مش موجود في Safari أقل من 17.4: اتعمل fallback.
5. **الـ Cart guard ضعيف**: بقى بيتحقق من كل field ومن الـ options وبيعمل clamp للكمية.
6. **الـ Stepper مكانش بيسمح بمسح الرقم**: اتعمل draft state.
7. **Checkout Now مكانش بيقول لو الكمية اتقصت**: الرسالة بقت جوه الـ drawer.
8. **الأسهم من option مش متاح** كانت بتروح لمكان غلط: بقت بتحسب الجار بالـ index.
9. **الـ Zoom كان بيفضل لما الصورة تتغير**: اتعمل reset بالـ key.
10. **Try again مكانش بيدي feedback**: بقى "Retrying…" ومعاه `aria-busy`.

---

## 15. الحدود الحالية والخطوات الجاية

- **Reviews و Recommendations** من fixtures لأن الـ API مش بيرجعهم، والـ hooks جاهزة للاستبدال.
- **Routing**: صفحة واحدة. الخطوة الجاية React Router أو TanStack Router، مع **مزامنة الـ variant مع الـ URL** (`?color=black&size=40`) عشان اللينك يبقى shareable.
- **Checkout** خارج نطاق التاسك.
- **i18n و RTL**: النصوص hard-coded. الخطوة الجاية i18n مع logical properties (`ps-`/`pe-`).
- **Image optimization**: الصور جاية من CDN واحد. ممكن نضيف `srcset` لو الـ CDN بيدعم resize.
- **Analytics و PWA و Product comparison** (bonus) متعملوش.
- **Self-host للخطوط** بدل Fontshare CDN، لتحسين الـ privacy والـ LCP.

---

## 16. أسئلة متوقعة في النقاش

**س: ليه Zustand مش Redux؟**
ج: التاسك طالبه، بس كمان مناسب: مفيش Provider، والـ API صغير، والـ selectors بتمنع re-renders. Redux Toolkit ممتاز للتطبيقات الكبيرة اللي فيها teams كتير، لكن هنا هيبقى boilerplate من غير فايدة.

**س: Immer بيفرق في إيه مع Zustand؟**
ج: بيخلّي الـ updates المتداخلة مقروءة (`line.quantity = 3` بدل spread على 3 مستويات)، ومع ذلك الـ state الناتج immutable بـ structural sharing. فيه test بيتأكد إن الـ reference القديم متغيرش.

**س: ليه React Query لو عندك Zustand؟**
ج: لأن **server state ≠ client state**. الـ server state محتاج cache و invalidation و retry و de-duplication و cancellation. حطه في Zustand يعني إعادة اختراع React Query.

**س: ليه الـ selection مش في الـ store؟**
ج: لأنه local للصفحة. الـ global state بيكون للحاجات اللي أكتر من مكان محتاجها أو لازم تعيش بعد الـ unmount.

**س: إيه اللي بيحصل لو localStorage فيه داتا غلط؟**
ج: الـ `merge` في `persist` بيعدّي كل item على `isCartItem` ويشيل اللي مش سليم ويعمل clamp للكمية، وعليه tests.

**س: إزاي بتمنع إن اليوزر يختار combination مش متاحة؟**
ج: بطريقتين: الـ options المستحيلة بتتقفل (`isOptionAvailable`)، ولو الاختيار الجديد خلّى اختيار قديم مستحيل بيتمسح (`applySelection`). يعني الـ UI مش بيوصل لحالة invalid أصلاً.

**س: ليه `<dialog>` native مش library؟**
ج: المتصفح بيدي focus trap و inert background و ESC و top layer و focus restore. كل ده كنت هكتبه بإيدي أو أجيب library. الـ browser support دلوقتي كامل.

**س: إزاي عملت pixel-perfect؟**
ج: طلّعت القيم بالـ Figma Plugin API مش بالعين، وحطيتها tokens. وبعد كده قارنت screenshots من headless Chrome على 1512 و375 بالـ Figma export، وصلحت الفروق.

**س: الـ dashed borders؟**
ج: CSS dashed مش بيتحكم في طول الشرطة. للخطوط استخدمت gradient بـ background-size 12px (6/6)، وللصناديق SVG rect بـ `stroke-dasharray`.

**س: لو الـ API رجع 1000 variant؟**
ج: الـ availability حالياً O(variants) لكل option. نبني index من نوع `Map<variation:value, Set<variantId>>` ونعمل intersection، أو نحسبه مرة واحدة في الـ mapper.

**س: Performance على الموبايل؟**
ج: صورة الـ LCP عليها `fetchPriority="high"`، والباقي lazy، والـ reviews والـ drawer chunks منفصلة، ومفيش CLS، والـ animations على الـ compositor، والـ observers بدل الـ listeners.

**س: إيه اللي ممكن يتكسر في production؟**
ج: الأسعار في الـ cart snapshot لازم السيرفر يعمل لها re-validate. والـ fixtures لازم تتشال. والخطوط من CDN خارجي.

**س: ليه `mix-blend-multiply` على الصور؟**
ج: صور الـ API خلفيتها بيضا والديزاين فيه well رمادي. الـ multiply بيخلّي الأبيض ياخد لون الخلفية من غير ما نعدّل الصور ولا نحتاج PNG شفاف.

**س: إزاي الـ tests بتحمي الـ accessibility؟**
ج: لأنها بتدوّر بـ `getByRole` و`getByLabel`. لو الـ role أو الـ label اتشال، الـ test بيفشل.

**س: ليه حوّلت الـ description لنص بدل HTML؟**
ج: الديزاين بيعرض فقرة نص، والعرض كنص بيشيل سطح الـ XSS كله. مبقاش فيه `dangerouslySetInnerHTML`، والـ bundle قلّ 13KB لما DOMPurify اتشال.

**س: إزاي "See More" بتقف بعد آخر كلمة بالظبط؟**
ج: CSS لوحده مش بيقدر. فيه twin مخفي بنفس العرض والخط، وbinary search على عدد الحروف اللي تكفي 4 سطور مع اللاحقة، وبعدها القص بيرجع لحدود كلمة. القياس بيتعاد مع الـ resize ولما الخطوط تخلص تحميل.

---

## 17. جولة التعديلات التانية

### تعديلات العميل
| # | الطلب | التنفيذ |
| --- | --- | --- |
| 1 | الـ Description نص مش نقاط | `htmlToPlainText` (DOMParser) بيحوّل القوايم والفقرات لجمل |
| 2 | "See More" لازقة في آخر كلمة | `useTextClamp`: twin مخفي + binary search + قص على حدود الكلمة |
| 3 | تقليل المسافة بين Color والـ Description | اتعمل، وبعدين **اترجّع لقيمة Figma** (40 و32px) في جولة الـ pixel perfect |
| 4 | شيل Quantity | اتشال من الصفحة، والكمية في الـ drawer. وكمان اتشال الـ flag `showQuantity` اللي بقى dead code |
| 5 | عدد على أيقونة القلب | `CountBadge` مشترك بين الـ cart والـ wishlist، ومعاه `aria-label` "Wishlist, 1 item" |
| 6 | stroke أرفع لدايرة التقييم | **5% من القطر = Figma بالظبط** (`innerRadius: 0.9`). التنفيذ الأولاني كان 10%، يعني أتخن من Figma بالضعف |
| 7 | padding أقل في الـ header | اتعمل، وبعدين **اترجّع لقيمة Figma** (31 و24px) |
| 8 | مسافة أقل بين Size وزرار Add To Cart | **مضبوطة على Figma**: 56px (desktop) و48px (mobile). المسافة = gap الـ stack الأب + `mt` الزراير، لأن `PurchasePanel` بيرجّع fragment |
| 9 | شيل Delivery T&C على الموبايل | `hidden lg:block`. ده **مطابق لـ Figma**، لأن الـ mobile frame مفيهوش اللينك ده أصلاً |

### مراجعة الـ Skills
**Senior Frontend**:
- `bundle_analyzer.py` طلّع إن `tailwindcss` و`@tailwindcss/vite` كانوا في `dependencies`، فاتنقلوا لـ `devDependencies` لأنهم build-time بس.
- اقتراح `next.config.js` مش منطبق لأن المشروع Vite SPA.
- الـ a11y checklist (semantic HTML و keyboard و ARIA و focus) متغطّية (القسم 9).

**React Best Practices (Vercel)**:
- `bundle-*`: DOMPurify اتشال (−13KB gzip)، والـ Reviews والـ Drawer لسه lazy chunks.
- `rendering-conditional-render`: لقينا `{item.compareAtPrice && …}` في `CartLine`، ولو القيمة `0` كانت هتطبع "0" على الشاشة، فبقت `!== null`. والـ conditionals الجديدة كلها ternary.
- `rendering-content-visibility`: utility اسمها `defer-render` على الـ sections اللي تحت الـ fold.
- `rendering-hoist-jsx`: لينك الـ size chart بقى ثابت برّه الـ component.
- `rerender-derived-state`: الـ wishlist بيعمل subscribe على `productIds.length` أو `includes(id)` (قيمة boolean أو رقم)، مش على الـ array كلها.
- `rerender-derived-state-no-effect`: اتشال الـ "setState أثناء الـ render" بتاع الـ quantity لما الـ section اتشال.
- `client-localstorage-schema`: الـ cart والـ wishlist ليهم `version` و validation.

**Senior Security**:
- **STRIDE** مختصر للـ SPA:
  - Tampering في localStorage: اتعالج بالـ validation.
  - XSS في الـ description: اتعالج بالعرض كنص.
  - Info disclosure: الـ secret scan 0.
  - Spoofing و Elevation: مش منطبقين لأن مفيش auth.
- **CSP** اتضافت للـ build.
- **Supply chain**: الـ runtime dependencies بقت 5 بس (react و react-dom و zustand و immer و react-query)، و`npm audit` بيقول 0 vulnerabilities.

**Clean Code**:
- `useAddToCart` كان function واحدة طويلة، واتقسم لـ `toCartInput` و`focusGroup` و`useGroupRefs` و`useAddedFeedback`، وكل واحدة بتعمل حاجة واحدة.
- الأرقام السحرية بقت ثوابت ليها أسماء: `ADDED_FEEDBACK_MS` و`QUANTITY_PER_CLICK` و`COLLAPSED_LINES` و`MAX_VISIBLE`.
- `pluralize()` بدل تكرار "item/items".
- اتشال الـ dead code: `showQuantity` و`is_quantity_hidden` و`sanitize.ts`.

---

## 18. التحقق من الـ Pixel perfect بالقياس

الشركة طالبة إن الـ UI يبقى **pixel perfect**، فالمقارنة اتعملت **بالأرقام مش بالعين**:
1. سكريبت Playwright بيفتح الصفحة على **1512px** و**375px**، وهما نفس عرض الـ Figma frames.
2. بيقيس مكان وحجم كل عنصر أساسي بـ `getBoundingClientRect()`.
3. بيقارن المسافات بالقيم اللي اتقرت من Figma (auto-layout gaps و padding و sizes)، بسماحية **±1px**.

### النتيجة: كل القياسات مطابقة

| القياس | Figma Desktop | Figma Mobile |
| --- | --- | --- |
| Promo bar | 42 | 58 |
| Promo → الخط المتقطع تحت الـ header | 94 | 75 |
| Rule → breadcrumb → product | 31 / 31 | 24 / 24 |
| الصورة الرئيسية | 458×610 | 279×372 |
| الصورة → الأزرار / الأزرار | 35 / 52 | 12 / 44 |
| الصورة → الـ thumbnails / عرض الـ thumbnail | 24 / 76 | 20 / 55.2 |
| Gallery → info | — | 56 |
| Brand → title → price → divider → description | 12 / 20 / 28 / 28 | 8 / 14 / 28 / 24 |
| Description → Color → Size | 40 / 40 | 32 / 32 |
| Label → options | 18 | 18 |
| Swatch | 75×40 | 73.7 و72.7 بالتبادل × 39.3 |
| Size → Add To Cart | 56 | 48 |
| Add To Cart | 296×58 (Fill) | 296×56 |
| Checkout | 200 (Fixed)، gap 24 | gap 18 |
| CTA → Delivery T&C | 38 | (مش موجود في الـ frame) |
| Sections | 80 | 56 |
| Rail title → grid / gap الكروت | 24 / 35 | 40 / 21 (rows 36) |
| صورة الكارت | 212×284 | 157×210 |
| Reviews title → box / ارتفاع الـ box | 24 / 226 | 16 / 253 |
| Filter / gap | 278 / 40 | — |
| Ring / bars | 84 / 8 | 64 / 8 |
| Tabs / tabs → reviews | 42 / 34 | 32 / 32 (من تحت السطر التاني للـ tabs، زي Figma) |
| زرار الـ like | 80×50 | 62×32 |
| Pagination | 44×44 | 36×36 |
| Footer: padding / content / الخط المتقطع / الارتفاع | 72 / 162 / 306 / 381 | 45 |

### الحاجات اللي اتصلحت في الجولة دي (كانت بتفرق عن Figma)
- **رجوع القيم اللي اتغيرت قبل كده**: padding الـ header (31 و24)، Description → Color (40 و32)، Size → CTA (56 و48).
- **Rating ring**: 5% من القطر زي `innerRadius: 0.9`.
- **صف الـ header على الموبايل**: كان 40px بسبب أزرار اللمس، فكل حاجة تحته كانت نازلة 13px. بقى ارتفاعه 27px زي Figma، والأزرار 40px لسه موجودة للمس وبتطلع برّه الصف.
- **اللوجو** بياخد نفس الـ box بتاع صورة اللوجو في Figma: 170×32 و140×26.
- **أزرار الـ CTA** بقت بنفس الـ sizing بتاع Figma: Add To Cart **Fill** و Checkout **Fixed 200**. كانت نسبة flex، فالزرار كان 285 بدل 296.
- **صفوف الـ rating**: ارتفاعها ثابت 26px على الـ desktop و17px على الموبايل، والـ box بقى 226 و253.
- **الـ Footer**:
  - الـ `li` بتاع أيقونات السوشيال كان بيزوّد الارتفاع (43 بدل 36).
  - اللينكات كانت 24px بدل 22.
  - الـ left frame ارتفاعه ثابت 160 زي Figma.
  - النتيجة: الـ content بقى 162 والخط المتقطع في 306 بالظبط.
  - الـ frame في Figma ارتفاعه ثابت 381 وبيقص آخر 3px من الـ auto-layout، فالمسافة الحقيقية تحت الصف الأخير 29px مش 32. والنص تحت الخط بيبدأ بعد 24px محسوبة من فوق الخط (الخط جوه الـ padding)، فبقت 23px + 1px خط. الـ footer بقى 381 بالظبط.
- **صورة الكارت على الموبايل**: Figma بيستخدم 157×210 مش نفس نسبة الـ desktop (212×284)، فالـ aspect ratio بقى مختلف لكل breakpoint.
- **زرار الـ like**: كان padding + عرض الرقم بيخليه 81.5 و63.6. بقى `min-width` بس (80 و62) والمحتوى في النص، والعرض بيكبر لوحده لو الرقم كبر.
- **الـ swatches على الموبايل**: Figma بيخليها 73.7 و72.7 بالتبادل، فالـ grid بقى `repeat(2, minmax(0,73.7px) minmax(0,72.7px))` مع `justify-between`، والمكان بين أول وآخر swatch 335 زي Figma. الـ `minmax(0, …)` بيخليها تصغر على شاشة 320 من غير overflow.

### فروق مقبولة (مش في الـ layout)
- **المحتوى من الـ API**: اسم المنتج أطول فبيلف سطرين، والوصف والصور مختلفين، فارتفاع الصفحة الكلي بيختلف. **المسافات بين العناصر هي اللي متطابقة.**
- **النتيجة**: سكريبت القياس بيقارن 90 قياس (desktop + mobile) وكلهم جوه ±1px من Figma.
