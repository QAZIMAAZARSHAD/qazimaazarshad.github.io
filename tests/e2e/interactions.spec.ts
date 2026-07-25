import { test, expect } from "@playwright/test";

async function ready(page: import("@playwright/test").Page) {
  await page
    .locator('[data-testid="preloader"]')
    .waitFor({ state: "detached" })
    .catch(() => {});
}

test.describe("Skill → Projects filter", () => {
  test("clicking a top skill filters the Projects section by it", async ({
    page,
  }) => {
    await page.goto("/");
    await ready(page);

    await page.locator("#skills").scrollIntoViewIfNeeded();
    await page
      .locator("#skills")
      .getByRole("button", { name: /^Filter projects by Java$/i })
      .first()
      .click();

    await expect(page.getByLabel("Search projects")).toHaveValue(/java/i);
  });
});

test.describe("Side navigation dots", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("navigates to a section when a dot is clicked", async ({ page }) => {
    await page.goto("/");
    await ready(page);

    const sideNav = page.getByRole("navigation", {
      name: "Section navigation",
    });
    await expect(sideNav).toBeVisible();

    await sideNav.getByRole("button", { name: "Projects" }).click();
    await expect(page).toHaveURL(/#projects$/);
  });
});
