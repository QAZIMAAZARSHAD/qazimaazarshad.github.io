import { test, expect, type Page } from "@playwright/test";
import { enterSite } from "./intro";

const heart = (page: Page) =>
  page.getByRole("button", { name: /love this site/i });
const loved = (page: Page) =>
  page.getByRole("button", { name: /you loved this site/i });

/**
 * Nothing here may touch the real counter or send a real email.
 *
 * The relay has to be stubbed regardless: Web3Forms blocks anything that isn't
 * a real browser, so a headless run gets a network-level failure rather than a
 * response. Verified by hand in headed Chrome instead.
 */
async function stub(page: Page, counts = 128) {
  const seen = { bumps: 0, mails: 0, notes: [] as string[] };

  await page.route("**/api.counterapi.dev/**", async (route) => {
    // Scoped to the loves key: the visit counter shares this host and bumps on
    // every load, so counting every /up here would count its traffic too.
    const url = route.request().url();
    if (url.includes("/loves/up")) seen.bumps += 1;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ count: counts }),
    });
  });

  await page.route("**/api.web3forms.com/**", async (route) => {
    seen.mails += 1;
    const body = route.request().postDataJSON() as { message?: string };
    seen.notes.push(body?.message ?? "");
    await route.fulfill({ contentType: "application/json", body: "{}" });
  });

  await page.addInitScript(() => {
    (
      window as unknown as { __VISIT_COUNTER_TEST__: boolean }
    ).__VISIT_COUNTER_TEST__ = true;
  });

  return seen;
}

async function toFooter(page: Page) {
  await page.goto("/");
  await enterSite(page);
  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400); // NOSONAR — settle the footer's entrance
}

test.describe("Footer reaction", () => {
  test("takes a love, counts it, and offers a line to say more", async ({
    page,
  }) => {
    const seen = await stub(page);
    await toFooter(page);

    await expect(page.getByText(/loved the site\?/i)).toBeVisible();
    await expect(page.getByText("128 loves")).toBeVisible();

    await heart(page).click();

    await expect(loved(page)).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("129 loves")).toBeVisible();
    await expect(page.getByPlaceholder(/say something/i)).toBeFocused();

    await expect.poll(() => seen.bumps).toBe(1);
    // One tap, one relay — and it carries the "nothing written" marker rather
    // than an empty body, so the mail reads sensibly on its own.
    await expect.poll(() => seen.mails).toBe(1);
    expect(seen.notes[0]).toMatch(/no note left/i);
  });

  test("sends the note that was written, not an empty one", async ({
    page,
  }) => {
    const seen = await stub(page);
    await toFooter(page);
    await heart(page).click();

    const send = page.getByRole("button", { name: /send note/i });
    await expect(send).toBeDisabled();

    await page.getByPlaceholder(/say something/i).fill("the door is lovely");
    await send.click();

    await expect(page.getByPlaceholder(/say something/i)).toHaveCount(0);
    await expect.poll(() => seen.notes.at(-1)).toMatch(/the door is lovely/);
  });

  // The heart is the only thing here a visitor can get wrong twice.
  test("remembers a visitor who already loved it", async ({ page }) => {
    const seen = await stub(page);
    await toFooter(page);
    await heart(page).click();
    await expect(loved(page)).toBeVisible();

    await page.reload();
    await enterSite(page);
    await page.locator("footer").scrollIntoViewIfNeeded();

    await expect(loved(page)).toBeVisible();
    await expect(heart(page)).toHaveCount(0);
    await expect.poll(() => seen.bumps).toBe(1);
  });

  test("shows the heart even when the counter is unreachable", async ({
    page,
  }) => {
    await page.route("**/api.counterapi.dev/**", (route) => route.abort());
    await toFooter(page);

    await expect(heart(page)).toBeVisible();
    await expect(page.getByText(/loves$/)).toHaveCount(0);
  });
});
