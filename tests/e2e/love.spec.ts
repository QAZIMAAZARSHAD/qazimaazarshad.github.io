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

  await page.route("**/abacus.jasoncameron.dev/**", async (route) => {
    // Scoped to the loves key: the visit counter shares this host and bumps on
    // every load, so counting every /hit here would count its traffic too.
    const url = route.request().url();
    const isBump = url.includes("/hit/") && url.includes("/loves");
    if (isBump) seen.bumps += 1;
    // A bump answers with the total *after* incrementing, as the real API does
    // — the UI reconciles its optimistic guess against exactly this number.
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ value: isBump ? counts + 1 : counts }),
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

    // aria-disabled, not aria-pressed: a love can be given, never taken back.
    await expect(loved(page)).toHaveAttribute("aria-disabled", "true");
    await expect(page.getByText("129 loves")).toBeVisible();
    await expect(page.getByPlaceholder(/say something/i)).toBeFocused();

    await expect.poll(() => seen.bumps).toBe(1);
    await expect.poll(() => seen.mails).toBe(1);
    // A poll passes on the first matching sample, so it cannot notice a second
    // relay arriving after. Settle, then assert the count held.
    await page.waitForTimeout(600); // NOSONAR — nothing more should arrive
    expect(seen.mails, "one tap, one relay").toBe(1);
    expect(seen.bumps, "one tap, one bump").toBe(1);
    // It carries the "nothing written" marker rather than an empty body, so
    // the mail reads sensibly on its own.
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
    // The note box is offered once, in the moment. Restoring it every visit
    // would leave an open, unbounded mail button in the footer.
    await expect(page.getByPlaceholder(/say something/i)).toHaveCount(0);

    await page.waitForTimeout(600); // NOSONAR — let any stray traffic land
    expect(seen.bumps, "a repeat visit counts nothing").toBe(1);
    expect(seen.mails, "a repeat visit relays nothing").toBe(1);
  });

  test("still works when the counter is unreachable", async ({ page }) => {
    // The opt-in has to come first, or the localhost guard returns before the
    // request is made and the abort below is never reached — the test would
    // pass without exercising the failure at all.
    await page.addInitScript(() => {
      (
        window as unknown as { __VISIT_COUNTER_TEST__: boolean }
      ).__VISIT_COUNTER_TEST__ = true;
    });
    let attempted = 0;
    await page.route("**/abacus.jasoncameron.dev/**", (route) => {
      attempted += 1;
      return route.abort();
    });
    await page.route("**/api.web3forms.com/**", (route) =>
      route.fulfill({ contentType: "application/json", body: "{}" }),
    );
    await toFooter(page);

    expect(attempted, "the counter really was attempted").toBeGreaterThan(0);
    await expect(page.getByText(/loves$/)).toHaveCount(0);

    // A heart that is visible but dead is the failure that matters here.
    await heart(page).click();
    await expect(loved(page)).toBeVisible();
    await expect(page.getByPlaceholder(/say something/i)).toBeVisible();
  });
});
