import { test, expect, type Page } from "@playwright/test";
import { enterSite } from "./intro";

const threshold = (page: Page) => page.locator("#threshold");
const year = (page: Page) => threshold(page).locator("p[aria-hidden]").first();

/**
 * Park the section at a fraction of its own travel through the viewport.
 * Measured in document coordinates — boundingBox() is viewport-relative, so
 * successive calls would compound the scroll already applied.
 */
async function scrollThrough(page: Page, fraction: number) {
  await page.evaluate((f) => {
    const el = document.querySelector("#threshold")!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + el.clientHeight * f - window.innerHeight,
      behavior: "instant",
    });
  }, fraction);
  await page.waitForTimeout(250); // NOSONAR — let the scroll-linked value settle
}

test.describe("Threshold", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await enterSite(page);
  });

  test("separates working life from what came before", async ({ page }) => {
    const ids = await page.$$eval("main > section", (nodes) =>
      nodes.map((n) => n.id),
    );

    expect(ids).toContain("threshold");
    // Skills sits with the professional half; everything after the line is not.
    expect(ids.indexOf("skills")).toBeLessThan(ids.indexOf("threshold"));
    expect(ids.indexOf("experience")).toBeLessThan(ids.indexOf("skills"));
    expect(ids.indexOf("threshold")).toBeLessThan(ids.indexOf("earlier"));
    expect(ids.indexOf("earlier")).toBeLessThan(ids.indexOf("projects"));
  });

  test("winds the year back as it is scrolled through", async ({ page }) => {
    await scrollThrough(page, 0.1);
    const before = Number(await year(page).innerText());

    // Fully past the section, so the rewind has certainly finished.
    await scrollThrough(page, 2);
    const after = Number(await year(page).innerText());

    expect(before).toBe(new Date().getFullYear());
    expect(after).toBeLessThan(before);

    // It has to land on the year the copy itself claims, or the divider
    // advertises a date its own sentence doesn't.
    const copy = await threshold(page)
      .getByText(/nobody asked me to build/i)
      .innerText();
    expect(copy).toContain(String(after));
  });

  test("hands off to the first section past the line", async ({ page }) => {
    await threshold(page).scrollIntoViewIfNeeded();
    await page.getByRole("link", { name: /keep going/i }).click();
    await expect(page.locator("#earlier")).toBeInViewport({ timeout: 5_000 });
  });

  test("the header follows the new order", async ({ page }) => {
    const labels = await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link")
      .allInnerTexts();

    expect(labels.indexOf("Skills")).toBeLessThan(
      labels.indexOf("Foundations"),
    );
    expect(labels.indexOf("Experience")).toBeLessThan(labels.indexOf("Skills"));
  });

  test.describe("reduced motion", () => {
    test("arrives at the far year without the rewind", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      await enterSite(page);

      await threshold(page).scrollIntoViewIfNeeded();
      await expect(year(page)).toHaveText("2016");
    });
  });

  test.describe("visual", () => {
    test("threshold", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      await enterSite(page);

      await threshold(page).scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(600); // NOSONAR — settle the entry animation

      await expect(threshold(page)).toHaveScreenshot("threshold.png");
    });
  });
});
