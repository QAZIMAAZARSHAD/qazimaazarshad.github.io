import { test, expect, type Page } from "@playwright/test";

async function ready(page: Page) {
  await page.goto("/");
  await page
    .locator('[data-testid="preloader"]')
    .waitFor({ state: "detached" })
    .catch(() => {});
}

const dock = (page: Page) => page.getByTestId("nav-dock");
const primary = (page: Page) =>
  page.getByRole("navigation", { name: "Primary" });

test.describe("Header dock", () => {
  test("morphs from an open bar into the floating dock on scroll", async ({
    page,
  }) => {
    await ready(page);
    await expect(dock(page)).toHaveAttribute("data-docked", "false");

    const openHeight = (await dock(page).boundingBox())!.height;

    await page.mouse.wheel(0, 800);
    await expect(dock(page)).toHaveAttribute("data-docked", "true");
    await page.waitForTimeout(700); // let the 500ms morph settle

    // Docking visibly contracts the bar and detaches it from the top edge.
    const dockedBox = (await dock(page).boundingBox())!;
    expect(dockedBox.height).toBeLessThan(openHeight);
    expect(dockedBox.y).toBeGreaterThan(0);

    await page.mouse.wheel(0, -900);
    await expect(dock(page)).toHaveAttribute("data-docked", "false");
  });

  test("the indicator follows the pointer and settles back on the active section", async ({
    page,
  }) => {
    await ready(page);
    await page.locator("#skills").scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 120);

    const nav = primary(page);
    await expect(nav.locator('a[aria-current="page"]')).toHaveAttribute(
      "href",
      "#skills",
    );

    const contact = nav.getByRole("link", { name: "Contact", exact: true });
    await contact.hover();
    await expect(contact.getByTestId("nav-indicator")).toBeVisible();
    // Hovering must not rewrite which section is current.
    await expect(nav.locator('a[aria-current="page"]')).toHaveAttribute(
      "href",
      "#skills",
    );

    // Leaving the list hands the indicator back to the section in view.
    await page.mouse.move(20, 400);
    await expect(
      nav
        .getByRole("link", { name: "Skills", exact: true })
        .getByTestId("nav-indicator"),
    ).toBeVisible();
  });

  // Regression: hovering used to strip the current section of its highlight,
  // so while the pointer was in the nav nothing showed where you were.
  test("the current section stays lit while the pointer explores elsewhere", async ({
    page,
  }) => {
    await ready(page);
    await page.locator("#skills").scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 120);

    const nav = primary(page);
    const skills = nav.getByRole("link", { name: "Skills", exact: true });
    await expect(nav.locator('a[aria-current="page"]')).toHaveAttribute(
      "href",
      "#skills",
    );
    await page.waitForTimeout(500); // settle the colour transition
    const lit = await skills.evaluate((el) => getComputedStyle(el).color);

    await nav.getByRole("link", { name: "Contact", exact: true }).hover();
    await page.waitForTimeout(500);

    await expect(skills).toHaveCSS("color", lit);
    // ...and it gains a standalone beam, so it stays distinguishable.
    await expect(skills.getByTestId("nav-active-beam")).toBeVisible();
  });

  // Regression: the drawer's state ignored the breakpoint, so widening past
  // 1280px hid the toggle while leaving the header stuck undocked.
  test("widening to desktop dismisses an open drawer", async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await ready(page);

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator("#mobile-menu")).toBeVisible();

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator("#mobile-menu")).toHaveCount(0);

    // The header can dock again rather than being pinned open.
    await page.mouse.wheel(0, 800);
    await expect(dock(page)).toHaveAttribute("data-docked", "true");
  });

  test("the scrim never swallows clicks meant for the page", async ({
    page,
  }) => {
    await ready(page);
    await page.mouse.wheel(0, 800);
    await expect(dock(page)).toHaveAttribute("data-docked", "true");

    // A nav link directly under the floating dock still activates.
    await primary(page)
      .getByRole("link", { name: "Projects", exact: true })
      .click();
    await expect(page).toHaveURL(/#projects$/);
    await expect(page.locator("#projects")).toBeInViewport();
  });

  test.describe("touch device", () => {
    test.use({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });

    test("docks on mobile and reopens for the drawer", async ({ page }) => {
      await ready(page);
      await page.mouse.wheel(0, 800);
      await expect(dock(page)).toHaveAttribute("data-docked", "true");

      // The drawer needs the full-width bar back.
      await page.getByRole("button", { name: "Open menu" }).click();
      await expect(dock(page)).toHaveAttribute("data-docked", "false");
      await expect(page.locator("#mobile-menu")).toBeVisible();
    });
  });
});
