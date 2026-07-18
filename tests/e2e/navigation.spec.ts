import { test, expect } from "@playwright/test";
// Playwright does not resolve the "@/" alias, so import via a relative path.
import { navSections } from "../../src/data/content";

test.describe("Navigation & page shell", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads with the right title and hero name", async ({ page }) => {
    await expect(page).toHaveTitle(/Qazi Maaz Arshad/);

    const heroHeading = page
      .locator("#hero")
      .getByRole("heading", { level: 1 });
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText("Qazi");
    await expect(heroHeading).toContainText("Maaz");
    await expect(heroHeading).toContainText("Arshad");
  });

  test("each desktop nav link scrolls its section into view", async ({
    page,
  }) => {
    const primaryNav = page.getByRole("navigation", { name: "Primary" });

    for (const { id, label } of navSections) {
      await primaryNav.getByRole("link", { name: label, exact: true }).click();

      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });

  test("resume link opens the PDF in a new tab", async ({ page }) => {
    const resume = page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Resume", exact: true });

    await expect(resume).toBeVisible();
    await expect(resume).toHaveAttribute("target", "_blank");
    await expect(resume).toHaveAttribute(
      "href",
      /resume\/Qazi_Maaz_Arshad_Resume\.pdf$/,
    );
  });

  test("back-to-top button appears on scroll and returns to the top", async ({
    page,
  }) => {
    const backToTop = page.getByRole("button", { name: "Back to top" });

    await expect(backToTop).toBeHidden();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(backToTop).toBeVisible();

    await backToTop.click();

    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 7_000 })
      .toBeLessThan(5);
  });
});
