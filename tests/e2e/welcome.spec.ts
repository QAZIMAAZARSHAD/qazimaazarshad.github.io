import { test, expect, type Page } from "@playwright/test";

const welcome = (page: Page) => page.getByTestId("welcome");
const intro = (page: Page) => page.locator('[data-testid="preloader"]');

/** Pin "now" so the local-time line is deterministic. */
async function freezeClock(page: Page) {
  await page.addInitScript(() => {
    const FIXED = new Date("2026-07-15T09:20:00Z").getTime();
    const OriginalDate = Date;
    class FrozenDate extends OriginalDate {
      constructor(...args: ConstructorParameters<typeof Date>) {
        if (args.length === 0) super(FIXED);
        else super(...args);
      }
      static now() {
        return FIXED;
      }
    }
    globalThis.Date = FrozenDate as DateConstructor;
  });
}

/** Wait for the flash to land on the visitor's own greeting. */
async function settled(page: Page) {
  await expect(welcome(page)).toHaveAttribute("data-settled", "true", {
    timeout: 15_000,
  });
}

test.describe("Welcome screen", () => {
  test("plays after the loader and then hands over to the page", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "commit" });

    await expect(welcome(page)).toBeVisible({ timeout: 10_000 });
    // The greeting lives inside the same overlay the whole suite waits on.
    await expect(intro(page)).toBeVisible();

    await settled(page);
    await expect(intro(page)).toHaveCount(0, { timeout: 15_000 });
    await expect(page.locator("#hero")).toBeVisible();
  });

  test("locks scrolling while it plays and releases it after", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(welcome(page)).toBeVisible({ timeout: 10_000 });

    await page.mouse.wheel(0, 600);
    // Polled, not read once: wheel events are dispatched asynchronously, so an
    // immediate read would pass even against a lock that does nothing.
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 2_000 })
      .toBe(0);

    await intro(page).waitFor({ state: "detached", timeout: 15_000 });
    await page.mouse.wheel(0, 600);
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(0);
  });

  // The scroll lock swallows the browser's own jump to a hash, so the intro
  // has to replay it — otherwise every deep link lands at the top instead.
  test("a deep link still lands on its section", async ({ page }) => {
    await page.goto("/#hobbies", { waitUntil: "commit" });
    // Wait for the intro to actually mount first — otherwise "detached" is
    // trivially true before React has rendered anything.
    await expect(welcome(page)).toBeVisible({ timeout: 10_000 });
    await intro(page).waitFor({ state: "detached", timeout: 15_000 });

    await expect(page.locator("#hobbies")).toBeInViewport();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  test("takes the page out of the accessibility tree while it plays", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(welcome(page)).toBeVisible({ timeout: 10_000 });

    const hidden = await page.evaluate(() => {
      const main = document.querySelector("main");
      return {
        ariaHidden: main?.getAttribute("aria-hidden"),
        inert: (main as HTMLElement | null)?.inert,
      };
    });
    expect(hidden).toEqual({ ariaHidden: "true", inert: true });

    await intro(page).waitFor({ state: "detached", timeout: 15_000 });
    const restored = await page.evaluate(() => {
      const main = document.querySelector("main");
      return {
        ariaHidden: main?.getAttribute("aria-hidden"),
        inert: (main as HTMLElement | null)?.inert,
      };
    });
    expect(restored).toEqual({ ariaHidden: null, inert: false });
  });

  test.describe("music", () => {
    test("offers a mute control that doesn't dismiss the intro", async ({
      page,
    }) => {
      await page.goto("/", { waitUntil: "commit" });
      await expect(welcome(page)).toBeVisible({ timeout: 10_000 });

      const mute = page.getByRole("button", { name: /^mute intro music$/i });
      await expect(mute).toBeVisible();

      // Clicking anywhere skips the intro, so this control has to be an
      // exception — otherwise reaching for mute would dismiss the greeting.
      await mute.click();
      await expect(intro(page)).toBeVisible();
      await expect(
        page.getByRole("button", { name: /^unmute intro music$/i }),
      ).toBeVisible();
    });

    test("stays silent under reduced motion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/", { waitUntil: "commit" });
      await expect(welcome(page)).toBeVisible({ timeout: 10_000 });

      await expect(
        page.getByRole("button", { name: /mute intro music/i }),
      ).toHaveCount(0);
    });
  });

  test("a keypress skips straight through", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(welcome(page)).toBeVisible({ timeout: 10_000 });

    await page.keyboard.press("Escape");
    // Far quicker than the 6.5s it would otherwise take.
    await expect(intro(page)).toHaveCount(0, { timeout: 3_000 });
  });

  test("a click skips straight through", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(welcome(page)).toBeVisible({ timeout: 10_000 });

    await page.mouse.click(400, 400);
    await expect(intro(page)).toHaveCount(0, { timeout: 3_000 });
  });

  test.describe("a French visitor in New York", () => {
    test.use({ locale: "fr-FR", timezoneId: "America/New_York" });

    test("is greeted in their own language", async ({ page }) => {
      await freezeClock(page);
      await page.goto("/", { waitUntil: "commit" });
      await settled(page);

      await expect(welcome(page)).toContainText("Bonjour");
      // The visitor's clock and timezone are deliberately not surfaced.
      await expect(welcome(page)).not.toContainText(/your time/i);
      await expect(welcome(page)).not.toContainText(/bengaluru/i);
    });
  });

  test.describe("a visitor already in India", () => {
    test.use({ locale: "hi-IN", timezoneId: "Asia/Kolkata" });

    test("is greeted in Hindi", async ({ page }) => {
      await freezeClock(page);
      await page.goto("/", { waitUntil: "commit" });
      await settled(page);

      await expect(welcome(page)).toContainText("नमस्ते");
    });
  });

  test.describe("reduced motion", () => {
    test("skips the flash and shows the greeting once", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/", { waitUntil: "commit" });

      // No flash to sit through — it lands settled immediately.
      await expect(welcome(page)).toHaveAttribute("data-settled", "true", {
        timeout: 10_000,
      });
      await expect(intro(page)).toHaveCount(0, { timeout: 6_000 });
    });
  });

  test.describe("visual", () => {
    test.use({ locale: "en-US", timezoneId: "America/New_York" });

    test("settled greeting", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await freezeClock(page);
      await page.goto("/", { waitUntil: "commit" });
      await page.evaluate(() => document.fonts.ready);
      await settled(page);

      await expect(welcome(page)).toHaveScreenshot("welcome.png");
    });
  });
});
