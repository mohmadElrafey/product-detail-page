/**
 * Store settings that are not secret and rarely change, so they live in code.
 * Kept free of `import.meta.env` so Node tooling (e.g. the Playwright specs) can import it.
 */
export const store = {
  storeSlug: 'clear-theme',
  productSlug: 'Sneakers12',
  currency: 'EGP',
  locale: 'en-US',
} as const
