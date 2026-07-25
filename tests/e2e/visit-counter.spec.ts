import { test, expect } from "@playwright/test";

// The counter is backed by CounterAPI.dev; we mock it so the test never touches
// the live counter. The init flag opts localhost into counting (the component
// otherwise skips local hosts so dev/CI never inflate the real total).
// reduced-motion makes the count-up settle instantly.
test.describe("Visit counter", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      (
        window as unknown as { __VISIT_COUNTER_TEST__: boolean }
      ).__VISIT_COUNTER_TEST__ = true;
    });
  });

  test("shows the running total from CounterAPI in the footer", async ({
    page,
  }) => {
    await page.route("**/api.counterapi.dev/**", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ count: 12431, name: "visits" }),
      }),
    );

    await page.goto("/");
    await page
      .locator('[data-testid="preloader"]')
      .waitFor({ state: "detached" })
      .catch(() => {});

    const counter = page.getByTestId("visit-counter");
    await counter.scrollIntoViewIfNeeded();
    await expect(counter).toBeVisible();
    await expect(counter).toContainText("12,431");
    await expect(counter).toContainText("visits");
  });

  test("stays hidden when the counter request fails", async ({ page }) => {
    await page.route("**/api.counterapi.dev/**", (route) =>
      route.fulfill({ status: 500, body: "" }),
    );

    await page.goto("/");
    await page
      .locator('[data-testid="preloader"]')
      .waitFor({ state: "detached" })
      .catch(() => {});

    await expect(page.getByTestId("visit-counter")).toHaveCount(0);
  });
});
