import { test, expect, devices, type Page } from "@playwright/test";
import { enterSite } from "./intro";

/**
 * Guards for the two pieces of motion that carry the site's character: the
 * curtain that splits away after the greeting, and the constellation drifting
 * behind the page.
 *
 * Both were removed at one point without a single test going red. Nothing here
 * is a pixel snapshot, because a snapshot could not have caught either one: the
 * visual suite runs the whole page under `prefers-reduced-motion: reduce`,
 * which switches both of these off by design, so their baselines never
 * contained them in the first place. What follows samples what is actually on
 * screen over time and asserts it moved.
 */

/** Open the door and hold at the settled greeting, ready to be skipped. */
async function waitAtGreeting(page: Page): Promise<void> {
  await page.goto("/");
  const door = page.getByRole("button", { name: /enter the site/i });
  await door.waitFor({ timeout: 15_000 });
  await door.click({ timeout: 15_000, force: true });
  await page
    .getByTestId("welcome")
    .waitFor({ state: "visible", timeout: 15_000 });
}

/**
 * Every position the curtain halves pass through on their way off screen,
 * sampled per frame. Start this before skipping the greeting; it resolves when
 * the intro leaves the DOM.
 */
function recordReveal(page: Page) {
  return page.evaluate(
    () =>
      new Promise<{ top: number[]; bottom: number[]; fade: number[] }>(
        (resolve) => {
          const top = document.querySelector('[data-testid="curtain-top"]');
          const bottom = document.querySelector(
            '[data-testid="curtain-bottom"]',
          );
          const frames = {
            top: [] as number[],
            bottom: [] as number[],
            fade: [] as number[],
          };
          const started = performance.now();

          const sample = () => {
            if (!top?.isConnected || !bottom?.isConnected) {
              resolve(frames);
              return;
            }
            frames.top.push(Math.round(top.getBoundingClientRect().top));
            frames.bottom.push(Math.round(bottom.getBoundingClientRect().top));
            frames.fade.push(Number(getComputedStyle(top).opacity));
            if (performance.now() - started > 4_000) {
              resolve(frames);
              return;
            }
            requestAnimationFrame(sample);
          };
          requestAnimationFrame(sample);
        },
      ),
  );
}

/** How many different places something came to rest in, frame to frame. */
const stops = (positions: number[]) => new Set(positions).size;

test.describe("The curtain splits open after the greeting", () => {
  test("both halves travel clear of the viewport", async ({ page }) => {
    await waitAtGreeting(page);

    const reveal = recordReveal(page);
    await page.keyboard.press("Escape");
    const { top, bottom } = await reveal;

    const height = page.viewportSize()!.height;

    // It starts closed, seam across the middle.
    expect(top[0]).toBeLessThanOrEqual(1);
    expect(bottom[0]).toBeGreaterThan(height / 4);

    // The top half exits upwards and the bottom half downwards, each clearing
    // its own half of the screen.
    expect(top.at(-1)!).toBeLessThan(-height * 0.4);
    expect(bottom.at(-1)!).toBeGreaterThan(height * 0.9);

    // Regression: a cut, or a fade with the panels left in place, would satisfy
    // the assertions above at the endpoints alone. This is the slide itself.
    expect(stops(top)).toBeGreaterThan(8);
    expect(stops(bottom)).toBeGreaterThan(8);
  });

  test("it slides on a phone too", async ({ browser }) => {
    const context = await browser.newContext(devices["iPhone 13"]);
    const page = await context.newPage();

    await waitAtGreeting(page);
    const reveal = recordReveal(page);
    await page.keyboard.press("Escape");
    const { top } = await reveal;

    expect(top.at(-1)!).toBeLessThan(-page.viewportSize()!.height * 0.4);
    expect(stops(top)).toBeGreaterThan(8);

    await context.close();
  });

  /**
   * The one case where it is meant to go quietly. Documented here so that
   * turning the split off for everybody can never be mistaken for this.
   */
  test("it fades instead for anyone who asked for less motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await waitAtGreeting(page);

    const reveal = recordReveal(page);
    await page.keyboard.press("Escape");
    const { top, fade } = await reveal;

    expect(stops(top)).toBeLessThanOrEqual(2);
    expect(Math.min(...fade)).toBeLessThan(0.5);
  });
});

/**
 * Read the constellation's own pixels rather than screenshotting the element:
 * it sits behind the entire page at -z-10, so a screenshot of that box is
 * mostly whatever is layered on top of it.
 */
function inspectCanvas(page: Page) {
  return page.getByTestId("constellation").evaluate((el) => {
    const canvas = el as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { lit: 0, fingerprint: 0 };

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let lit = 0;
    let fingerprint = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) {
        lit++;
        // Position-sensitive, so the same number of stars in different places
        // does not read as no change at all.
        fingerprint = (fingerprint + i * data[i]) % 2_147_483_647;
      }
    }
    return { lit, fingerprint };
  });
}

test.describe("The constellation drifts behind the page", () => {
  test("it is painted, and it keeps moving", async ({ page }) => {
    await page.goto("/");
    await enterSite(page);

    const first = await inspectCanvas(page);
    expect(first.lit).toBeGreaterThan(0);

    await page.waitForTimeout(600);
    const second = await inspectCanvas(page);

    expect(second.lit).toBeGreaterThan(0);
    // Stars in new places: the loop is running, not one frame left standing.
    expect(second.fingerprint).not.toBe(first.fingerprint);
  });

  /**
   * Regression: this was switched off on touchscreens on the grounds that no
   * cursor can reach it, which missed that it drifts by itself and is the one
   * thing back here anybody notices.
   */
  test("it runs on a phone, where there is no cursor to push it", async ({
    browser,
  }) => {
    const context = await browser.newContext(devices["iPhone 13"]);
    const page = await context.newPage();

    await page.goto("/");
    await enterSite(page);

    const first = await inspectCanvas(page);
    expect(first.lit).toBeGreaterThan(0);

    await page.waitForTimeout(600);
    expect((await inspectCanvas(page)).fingerprint).not.toBe(first.fingerprint);

    await context.close();
  });

  test("it stands down for anyone who asked for less motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await enterSite(page);

    expect((await inspectCanvas(page)).lit).toBe(0);
  });
});
