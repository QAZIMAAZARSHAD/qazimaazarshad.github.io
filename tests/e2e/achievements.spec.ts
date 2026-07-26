import { test, expect } from "@playwright/test";

async function ready(page: import("@playwright/test").Page) {
  await page
    .locator('[data-testid="preloader"]')
    .waitFor({ state: "detached" })
    .catch(() => {});
}

test.describe("Achievements — certificate & profile links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#achievements");
    await ready(page);
    await page.locator("#achievements").scrollIntoViewIfNeeded();
  });

  const section = (page: import("@playwright/test").Page) =>
    page.locator("#achievements");

  test("coding-profile achievements link out to LeetCode and HackerRank", async ({
    page,
  }) => {
    const sec = section(page);
    const leetcode = sec.getByRole("link", { name: /leetcode/i });
    const hackerrank = sec.getByRole("link", { name: /hackerrank/i });

    await expect(leetcode).toHaveAttribute("href", /leetcode\.com/);
    await expect(leetcode).toHaveAttribute("target", "_blank");
    await expect(hackerrank).toHaveAttribute("href", /hackerrank\.com/);
  });

  test("a certificate-linked achievement opens the lightbox and closes", async ({
    page,
  }) => {
    await section(page)
      .getByRole("button", { name: /national engineering olympiad/i })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("img").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("the Gold Medal opens a gallery: photo has no download, certificate does", async ({
    page,
  }) => {
    await section(page)
      .getByRole("button", { name: /international humanity olympiad/i })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const thumbs = dialog.getByRole("button", { name: /view image/i });
    await expect(thumbs).toHaveCount(2);

    // First slide is the ceremony photo — no download.
    await expect(dialog.getByRole("link", { name: /download/i })).toHaveCount(
      0,
    );

    // Second slide is the certificate — download appears.
    await thumbs.nth(1).click();
    await expect(dialog.getByRole("link", { name: /download/i })).toHaveCount(
      1,
    );
  });
});
