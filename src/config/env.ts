/**
 * Runtime configuration. Everything is overridable through Vite env vars
 * (see `.env.example`) so the same build can point at another store/product.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://api.easy-orders.net/api/v1',
  storeSlug: import.meta.env.VITE_STORE_SLUG ?? 'clear-theme',
  productSlug: import.meta.env.VITE_PRODUCT_SLUG ?? 'Sneakers12',
  currency: import.meta.env.VITE_CURRENCY ?? 'EGP',
  locale: import.meta.env.VITE_LOCALE ?? 'en-US',
} as const

/** Upper bound per cart line when the API does not track stock. */
export const MAX_QUANTITY_PER_LINE = 10
