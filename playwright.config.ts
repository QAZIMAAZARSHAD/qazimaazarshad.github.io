import { defineConfig, devices } from "@playwright/test";

/**
 * E2E, visual, and responsiveness tests.
 * Uses the Vite dev server (base "/"), reusing one if already running.
 */
/**
 * Worker count. Override with PLAYWRIGHT_WORKERS.
 *
 * CI used to force 1 and the suite took 10m+; browsers spend most of that time
 * waiting on the intro / animations, so oversubscribing a 2-core runner is a
 * net win. Locally Playwright's default (half the CPUs) is fine.
 */
const workers = process.env.PLAYWRIGHT_WORKERS
  ? Number(process.env.PLAYWRIGHT_WORKERS)
  : process.env.CI
    ? 4
    : undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers,
  reporter: [["list"]],
  timeout: 30_000,
  expect: {
    timeout: 7_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: "disabled" },
  },
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
