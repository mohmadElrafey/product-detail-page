/**
 * Runtime configuration, read from Vite env vars (`.env` locally, the hosting
 * provider's environment variables in production). Nothing is hard-coded here:
 * a missing variable fails fast with a clear message instead of silently
 * pointing the build at some default store.
 */
function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing environment variable ${name}. Add it to .env (or to the hosting provider's settings).`)
  }
  return value.trim()
}

export const env = {
  apiBaseUrl: required('VITE_API_BASE_URL'),
  storeSlug: required('VITE_STORE_SLUG'),
  productSlug: required('VITE_PRODUCT_SLUG'),
  currency: required('VITE_CURRENCY'),
  locale: required('VITE_LOCALE'),
} as const

/** Upper bound per cart line when the API does not track stock. */
export const MAX_QUANTITY_PER_LINE = 10
