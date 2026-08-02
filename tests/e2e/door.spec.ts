import { test, expect, type Page } from "@playwright/test";

const intro = (page: Page) => page.locator('[data-testid="preloader"]');
const door = (page: Page) =>
  page.getByRole("button", { name: /enter the site/i });

test.describe("Entry door", () => {
  test("follows the loader and waits to be opened", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });

    // The loader comes first and holds before handing over.
    await expect(page.getByText("Loading")).toBeVisible({ timeout: 10_000 });
    await expect(door(page)).toBeVisible({ timeout: 10_000 });

    // The door has no timeout of its own — it stays until it is opened. There
    // is no event to await here; the point is that nothing happens.
    await page.waitForTimeout(1_500); // NOSONAR
    await expect(door(page)).toBeVisible();
    await expect(page.getByTestId("welcome")).toHaveCount(0);
  });

  test("takes focus so it can be opened without a mouse", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(door(page)).toBeFocused({ timeout: 10_000 });

    await page.keyboard.press("Enter");
    await expect(page.getByTestId("welcome")).toBeVisible({ timeout: 10_000 });
  });

  // Regression: focus is sent to the door the moment the intro arrives, and
  // that was treated as approach — so the door hung open, and its focus ring
  // boxed in the caption, before anyone had touched anything.
  test("arrives shut, and only eases open under the pointer", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(door(page)).toBeFocused({ timeout: 10_000 });
    await page.waitForTimeout(700); // NOSONAR — past any entrance transition

    const panel = () =>
      door(page).evaluate(
        (el) => getComputedStyle(el.querySelector(".origin-left")!).transform,
      );

    expect(await panel(), "shut on arrival").toBe("none");

    await door(page).hover();
    await expect.poll(panel, { timeout: 3_000 }).not.toBe("none");

    await page.mouse.move(5, 5);
    await expect.poll(panel, { timeout: 3_000 }).toBe("none");
  });

  // A focused door with no visible ring is unusable by keyboard, and hovering
  // then moving the mouse away used to wipe the indicator while it was still
  // focused.
  test("stays visibly focused after the pointer comes and goes", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(door(page)).toBeFocused({ timeout: 10_000 });
    // Arm the ring the way a keyboard visitor would.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(door(page)).toBeFocused();

    await door(page).hover();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(300); // NOSONAR — the colour transition

    const state = await door(page).evaluate((el) => {
      // The ring is on the doorway, so that it frames the door rather than
      // boxing in the caption underneath it.
      const frame = el.querySelector("span.relative.block")!;
      return {
        focused: document.activeElement === el,
        shadow: getComputedStyle(frame).boxShadow,
        label: (el.textContent ?? "").trim(),
      };
    });

    expect(state.focused).toBe(true);
    expect(state.label).toContain("Come in");
    // Tailwind's focus ring is a box-shadow; "none" means no indicator at all.
    expect(state.shadow).not.toBe("none");
  });

  // Focus is put on the door before the visitor has done anything, and the
  // browser counts that as keyboard-driven — so a mouse user was met by a ring
  // around the door that read as the component being selected.
  test("arrives without a focus ring, and rings once a key is used", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(door(page)).toBeFocused({ timeout: 10_000 });

    const ring = () =>
      door(page).evaluate(
        (el) =>
          getComputedStyle(el.querySelector("span.relative.block")!).boxShadow,
      );

    expect(await ring(), "quiet on arrival").toBe("none");

    await page.mouse.move(512, 350);
    await page.waitForTimeout(250); // NOSONAR — nothing should follow from this
    expect(await ring(), "still quiet for a pointer").toBe("none");

    // Tab leaves the door and comes back to it, the way a keyboard visitor
    // reaches it — and now the ring is earned.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(door(page)).toBeFocused();
    expect(await ring()).not.toBe("none");
  });

  // The intro covers the page, so Tab must not walk into it. The floating
  // widgets sit beside main/header/footer, so inerting those three by name left
  // the assistant, the scroll-dots and back-to-top all reachable.
  test("keyboard focus cannot escape into the page behind it", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(door(page)).toBeFocused({ timeout: 10_000 });

    const reached: string[] = [];
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      reached.push(
        await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return "BODY";
          return el.getAttribute("aria-label") ?? el.tagName;
        }),
      );
    }

    for (const stop of reached) {
      expect(["BODY", "Come in — enter the site"]).toContain(stop);
    }
  });

  test("keeps the visitor's focus while it swings open", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(door(page)).toBeFocused({ timeout: 10_000 });
    await page.keyboard.press("Enter");

    // Mid-flight: a `disabled` button would have dumped focus onto <body>.
    const onBody = await page.evaluate(
      () => document.activeElement === document.body,
    );
    expect(onBody).toBe(false);
  });

  test("a held Enter still only opens it once", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(door(page)).toBeFocused({ timeout: 10_000 });

    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");

    await expect(page.getByTestId("welcome")).toHaveCount(1, {
      timeout: 10_000,
    });
    await expect(intro(page)).toHaveCount(0, { timeout: 15_000 });
  });

  // A stray key used to be able to dismiss the whole intro; while the door is
  // up it must do nothing, or the visitor never hears the greeting.
  test("ignores stray keys and clicks until it is actually opened", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "commit" });
    await expect(door(page)).toBeVisible({ timeout: 10_000 });

    await page.keyboard.press("Escape");
    await page.mouse.click(60, 60);
    // Again, the assertion is that nothing followed from those.
    await page.waitForTimeout(400); // NOSONAR

    await expect(intro(page)).toBeVisible();
    await expect(door(page)).toBeVisible();
  });

  test("opens into the greeting, then the page", async ({ page }) => {
    await page.goto("/", { waitUntil: "commit" });
    await door(page).click({ timeout: 10_000 });

    await expect(page.getByTestId("welcome")).toBeVisible({ timeout: 10_000 });
    await expect(intro(page)).toHaveCount(0, { timeout: 15_000 });
    await expect(page.locator("#hero")).toBeVisible();
  });

  // Regression: the backdrop lived inside the door's entrance-animated wrapper,
  // and a transformed ancestor becomes the containing block for its full-screen
  // descendants — so it was boxed into that column until the transform settled.
  test("the scenery covers the viewport from the moment the door appears", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "commit" });
    await expect(door(page)).toBeVisible({ timeout: 10_000 });

    // Sampled immediately, while the entrance transform is still running.
    const box = await page.evaluate(() => {
      const r = document
        .querySelector('[data-testid="door-scenery"]')
        ?.getBoundingClientRect();
      return r ? { w: Math.round(r.width), h: Math.round(r.height) } : null;
    });

    expect(box).not.toBeNull();
    expect(box!.w).toBe(1280);
    expect(box!.h).toBe(800);
  });

  test.describe("reduced motion", () => {
    test("still opens, without the flight", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/", { waitUntil: "commit" });

      await door(page).click({ timeout: 10_000 });
      await expect(page.getByTestId("welcome")).toBeVisible({
        timeout: 10_000,
      });
      await expect(intro(page)).toHaveCount(0, { timeout: 10_000 });
    });
  });

  test.describe("visual", () => {
    test("closed door", async ({ page }) => {
      // Reduced motion stills the aurora and the flight, so this is stable.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto("/", { waitUntil: "commit" });
      await expect(door(page)).toBeVisible({ timeout: 10_000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400); // NOSONAR — let the entrance settle

      await expect(intro(page)).toHaveScreenshot("entry-door.png");
    });
  });
});
