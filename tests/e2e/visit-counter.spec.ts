import { test, expect } from "@playwright/test";

// The counter is backed by GoatCounter; we mock its endpoint so the test never
// depends on live traffic. reduced-motion makes the count-up settle instantly.
test.describe("Visit counter", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/gc.zgo.at/**", (route) => route.abort());
  });

  test("shows the total from GoatCounter in the footer", async ({ page }) => {
    await page.route("**/counter/TOTAL.json", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ count: "12,431", count_unique: "9,210" }),
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

  test("stays hidden when the counter endpoint fails", async ({ page }) => {
    await page.route("**/counter/TOTAL.json", (route) =>
      route.fulfill({ status: 403, body: "" }),
    );

    await page.goto("/");
    await page
      .locator('[data-testid="preloader"]')
      .waitFor({ state: "detached" })
      .catch(() => {});

    await expect(page.getByTestId("visit-counter")).toHaveCount(0);
  });
});
