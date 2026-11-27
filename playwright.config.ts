import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

// E2E settings come from .env (git-ignored); a CI runner can set them as real env vars instead.
if (existsSync('.env')) process.loadEnvFile('.env')

const PORT = 4173

/** Host the E2E specs open, without the port (e.g. `http://localhost`). */
const E2E_BASE_URL = process.env.E2E_BASE_URL?.trim().replace(/\/+$/, '')
if (!E2E_BASE_URL) {
  throw new Error('Missing environment variable E2E_BASE_URL. Add it to .env (e.g. E2E_BASE_URL=http://localhost).')
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `${E2E_BASE_URL}:${PORT}`,
    trace: 'on-first-retry',
    // Uses the locally installed Google Chrome; run `npx playwright install chromium`
    // and drop `channel` to use Playwright's bundled browser instead.
    channel: process.env.PW_CHANNEL ?? 'chrome',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1512, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
