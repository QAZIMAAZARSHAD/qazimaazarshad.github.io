import { test, expect } from "@playwright/test";
import { enterSite } from "./intro";

// The counter is backed by Abacus; we mock it so the test never touches the
// live counter. The init flag opts localhost into counting (the component
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

  test("shows the running total from the counter in the footer", async ({
    page,
  }) => {
    await page.route("**/abacus.jasoncameron.dev/**", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ value: 12431 }),
      }),
    );

    await page.goto("/");
    await enterSite(page);

    const counter = page.getByTestId("visit-counter");
    await counter.scrollIntoViewIfNeeded();
    await expect(counter).toBeVisible();
    await expect(counter).toContainText("12,431");
    await expect(counter).toContainText("visits");
  });

  test("stays hidden when the counter request fails", async ({ page }) => {
    await page.route("**/abacus.jasoncameron.dev/**", (route) =>
      route.fulfill({ status: 500, body: "" }),
    );

    await page.goto("/");
    await enterSite(page);

    await expect(page.getByTestId("visit-counter")).toHaveCount(0);
  });
});
