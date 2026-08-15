import { test, expect, type Page } from "@playwright/test";
import { enterSite } from "./intro";

/** The first word of the name — the element the mask actually moves. */
const firstWord = (page: Page) =>
  page.locator('#hero h1 [aria-hidden="true"] > span > span').first();

const portrait = (page: Page) => page.locator("#hero img").first();

test("the hero holds its entrance until the intro hands over", async ({
  page,
}) => {
  await page.goto("/");

  // The door waits as long as it takes, so this is a stable moment to look at
  // the page underneath. It mounts with everything else on first render, and
  // used to run its entrance here — finished and sitting still long before the
  // curtain parted.
  await page.getByRole("button", { name: /enter the site/i }).waitFor();
  await expect(firstWord(page)).toHaveCSS("opacity", "0");

  await enterSite(page);
  await expect(firstWord(page)).toHaveCSS("opacity", "1");
});

test("the portrait ends sharp and every chip arrives", async ({ page }) => {
  await page.goto("/");
  await enterSite(page);

  await expect(portrait(page)).toHaveCSS("filter", "blur(0px)");
  for (const label of ["React", "TypeScript", "Java", "Spring Boot"]) {
    await expect(
      page.locator("#hero").getByText(label, { exact: true }),
    ).toBeVisible();
  }
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  // Every hidden state in the entrance parks its element out of frame. If the
  // reduced-motion branch ever went back to leaning on MotionConfig, which
  // drops the transform but keeps the element, the copy would stay there.
  test("leaves nothing parked off screen", async ({ page }) => {
    await page.goto("/");
    await enterSite(page);

    const word = firstWord(page);
    await expect(word).toHaveCSS("opacity", "1");
    await expect(word).toHaveCSS("transform", "none");
    await expect(page.locator("#hero h1")).toBeInViewport();
  });
});
