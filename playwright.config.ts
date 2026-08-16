import { defineConfig, devices } from "@playwright/test";

/**
 * E2E, visual, and responsiveness tests.
 * Uses the Vite dev server (base "/"), reusing one if already running.
 *
 * Chromium is the primary project (full suite + visual baselines).
 * Firefox and WebKit run the same specs locally; CI smokes a critical subset.
 */
/**
 * Override with PLAYWRIGHT_WORKERS. Most of a run is spent waiting on the
 * intro and animations, so oversubscribing a small CI runner still pays.
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
    // Tight enough to catch layout regressions; text-only subpixel shifts on
    // macOS still need an occasional baseline refresh after large section moves.
    toHaveScreenshot: { maxDiffPixelRatio: 0.015, animations: "disabled" },
  },
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Wider than the stock Desktop Firefox/Safari presets (1280): WebKit's
    // classic scrollbar shrinks the media-query viewport, which used to hide
    // the xl/min-[1180px] desktop nav at exactly 1280 CSS pixels.
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
