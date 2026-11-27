/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/** Variables the app cannot run without (see `src/config/env.ts`). */
const REQUIRED_ENV = ['VITE_API_BASE_URL'] as const

/**
 * Content-Security-Policy for the production build only (the dev server needs
 * inline scripts for React Fast Refresh). Every origin is explicit: the product
 * API (taken from VITE_API_BASE_URL), the image CDN and the two font providers.
 * `style-src 'unsafe-inline'` is required for React `style` props (zoom origin, colour swatches).
 * Prefer sending this as an HTTP header in production (also enables `frame-ancestors`).
 */
const contentSecurityPolicyFor = (apiOrigin: string) =>
  [
    "default-src 'self'",
    "script-src 'self'",
    `connect-src 'self' ${apiOrigin}`,
    "img-src 'self' data: https://easyorders.fra1.digitaloceanspaces.com",
    "style-src 'self' 'unsafe-inline' https://api.fontshare.com https://fonts.googleapis.com",
    "font-src https://cdn.fontshare.com https://fonts.gstatic.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

/**
 * Production build only: fails fast when a required variable is missing, then adds
 * the CSP meta tag and a preconnect to the API origin, both derived from the env.
 */
function envAwareHtml(env: Record<string, string>): Plugin {
  return {
    name: 'env-aware-html',
    apply: 'build',
    configResolved() {
      const missing = REQUIRED_ENV.filter((name) => !env[name]?.trim())
      if (missing.length > 0) {
        throw new Error(
          `Missing environment variables: ${missing.join(', ')}. Add them to .env or the hosting provider's settings.`,
        )
      }
    },
    transformIndexHtml: () => {
      const apiOrigin = new URL(env.VITE_API_BASE_URL!).origin
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: contentSecurityPolicyFor(apiOrigin) },
          injectTo: 'head-prepend',
        },
        { tag: 'link', attrs: { rel: 'preconnect', href: apiOrigin, crossorigin: true }, injectTo: 'head' },
      ]
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // loadEnv reads .env files and also VITE_* variables set by the host (e.g. Vercel).
  plugins: [react(), tailwindcss(), envAwareHtml(loadEnv(mode, process.cwd(), 'VITE_'))],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    restoreMocks: true,
  },
}))
