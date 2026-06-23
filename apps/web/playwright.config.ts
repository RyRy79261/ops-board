import { defineConfig, devices } from "@playwright/test";

// E2E config. The app runs under `next dev` (NOT a production build) so the
// E2E_TEST_AUTH seam in lib/session.ts is live — Next inlines NODE_ENV, so a
// production build statically drops the seam branch entirely. DB_DRIVER=node-
// postgres points the app at a throwaway plain-Postgres with no Neon endpoint
// (a real Neon branch works too: unset DB_DRIVER, point DATABASE_URL at it).
// globalSetup migrates + seeds the schema before any spec runs.

const PORT = Number(process.env.E2E_PORT ?? "3100");
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  // Shared seeded DB + a single dev server → run serially for determinism.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["github"]] : [["list"]],
  // next dev compiles each route on first hit, so the first navigation is slow.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec next dev -p ${PORT}`,
    url: BASE_URL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    // Merged onto process.env by Playwright — DATABASE_URL is inherited from the
    // shell (the throwaway Postgres / Neon branch).
    env: {
      E2E_TEST_AUTH: "1",
      DB_DRIVER: "node-postgres",
    },
  },
});
