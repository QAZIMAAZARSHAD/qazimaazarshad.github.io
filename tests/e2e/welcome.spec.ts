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

/**
 * Open the door, which is what starts the greeting (and its music). These
 * tests drive the intro deliberately rather than using the shared helper,
 * which skips past it.
 */
async function openDoor(page: Page) {
  await page
    .getByRole("button", { name: /enter the site/i })
    .click({ timeout: 15_000 });
  await expect(welcome(page)).toBeVisible({ timeout: 10_000 });
}

test.describe("Welcome screen", () => {
  test("plays after the loader and then hands over to the page", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "commit" });

    await openDoor(page);
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
    await openDoor(page);

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
    await openDoor(page);
    await intro(page).waitFor({ state: "detached", timeout: 15_000 });

    await expect(page.locator("#hobbies")).toBeInViewport();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  test("takes the page out of the accessibility tree while it plays", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "commit" });
    await openDoor(page);

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
    // Browsers refuse unprompted audible playback on a fresh profile, and the
    // intro offers no gesture to satisfy that — so the refusal must be a
    // non-event, not something that stalls or breaks the greeting.
    test("still plays through when the browser refuses to start the track", async ({
      page,
    }) => {
      await page.addInitScript(() => {
        HTMLMediaElement.prototype.play = () =>
          Promise.reject(
            new DOMException("blocked by autoplay policy", "NotAllowedError"),
          );
      });

      await page.goto("/", { waitUntil: "commit" });
      await openDoor(page);

      await settled(page);
      await expect(intro(page)).toHaveCount(0, { timeout: 15_000 });
      await expect(page.locator("#hero")).toBeVisible();
    });

    test("puts no audio controls on screen", async ({ page }) => {
      await page.goto("/", { waitUntil: "commit" });
      await openDoor(page);

      await expect(
        intro(page).getByRole("button", { name: /mute|sound|music/i }),
      ).toHaveCount(0);
    });
  });

  test("a keypress skips straight through", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await openDoor(page);

    await page.keyboard.press("Escape");
    // Far quicker than the 6.5s it would otherwise take.
    await expect(intro(page)).toHaveCount(0, { timeout: 3_000 });
  });

  test("a click skips straight through", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await openDoor(page);

    await page.mouse.click(400, 400);
    await expect(intro(page)).toHaveCount(0, { timeout: 3_000 });
  });

  test.describe("a French visitor in New York", () => {
    test.use({ locale: "fr-FR", timezoneId: "America/New_York" });

    test("is greeted in their own language", async ({ page }) => {
      await freezeClock(page);
      await page.goto("/", { waitUntil: "commit" });
      await openDoor(page);
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
      await openDoor(page);
      await settled(page);

      await expect(welcome(page)).toContainText("नमस्ते");
    });
  });

  test.describe("reduced motion", () => {
    test("skips the flash and shows the greeting once", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/", { waitUntil: "commit" });
      await openDoor(page);

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
      await openDoor(page);
      await settled(page);
      // data-settled flips when the flash ends, which is a beat before the
      // final greeting has finished painting. Under parallel load the shot
      // could otherwise catch it mid-transition.
      await page.waitForTimeout(400); // NOSONAR

      await expect(welcome(page)).toHaveScreenshot("welcome.png");
    });
  });
});
