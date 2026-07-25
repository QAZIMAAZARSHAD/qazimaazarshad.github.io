import { test, expect } from "@playwright/test";

test.describe("Certifications", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#certifications");
    await page
      .locator('[data-testid="preloader"]')
      .waitFor({ state: "detached" })
      .catch(() => {});
  });

  const section = (page: import("@playwright/test").Page) =>
    page.locator("#certifications");

  test("filters, searches, and opens a certificate in the lightbox", async ({
    page,
  }) => {
    const sec = section(page);
    await expect(
      sec.getByRole("heading", { name: /certificates & credentials/i }),
    ).toBeVisible();

    const cards = sec.locator("button[aria-label^='View certificate']");
    await expect(cards.first()).toBeVisible();

    // Truncated card titles carry a native tooltip (title attribute).
    await expect(cards.first().locator("h3[title]")).toHaveCount(1);

    // Filter to a specific category.
    await sec.getByRole("button", { name: /Courses & MOOCs/i }).click();
    await expect(cards.first()).toBeVisible();

    // Open the first card → lightbox dialog, then close with Escape.
    await cards.first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    // Search narrows results.
    await sec.getByLabel("Search certificates").fill("coursera");
    await expect(cards.first()).toBeVisible();
    await expect(
      sec.getByRole("button", { name: /No certificates|Clear filters/i }),
    ).toHaveCount(0);
  });

  test("show more reveals additional certificates", async ({ page }) => {
    const sec = section(page);
    const cards = sec.locator("button[aria-label^='View certificate']");
    const initial = await cards.count();
    const showMore = sec.getByRole("button", { name: /show more/i });
    if (await showMore.count()) {
      await showMore.click();
      await expect(cards.count()).resolves.toBeGreaterThan(initial);
    }
  });
});
