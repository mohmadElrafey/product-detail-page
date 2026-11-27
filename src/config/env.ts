import { store } from './store'

/**
 * Runtime configuration. The API base URL is the only value that comes from the
 * environment (`.env` locally, Vercel's environment variables in production) and
 * is never hard-coded: a missing value fails fast with a clear message.
 * Non-secret store settings come from `./store`.
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
  ...store,
} as const

/** Upper bound per cart line when the API does not track stock. */
export const MAX_QUANTITY_PER_LINE = 10
