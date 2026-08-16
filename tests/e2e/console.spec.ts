import { test, expect, type Page } from "@playwright/test";

/** Console messages, collected from before the first byte of the page runs. */
function transcript(page: Page): string[] {
  const lines: string[] = [];
  page.on("console", (message) => lines.push(message.text()));
  return lines;
}

/**
 * Wait for the page behind the intro, which mounts a frame after it. Counting
 * canvases before that lands would miss the animated backdrop and read the
 * confetti's own canvas as one that was already there.
 */
async function pageBehindIntro(page: Page): Promise<void> {
  await page.locator("main").waitFor({ state: "attached" });
}

test("greets anyone who opens the console, and says what to run", async ({
  page,
}) => {
  const lines = transcript(page);
  await page.goto("/");

  const printed = lines.join("\n");
  expect(printed).toContain("█");
  expect(printed).toContain("Hey sneaky dev");
  expect(printed).toContain("hireMaaz()");
});

test("hireMaaz() throws confetti and hands back a way to reach me", async ({
  page,
}) => {
  await page.goto("/");
  await pageBehindIntro(page);
  const before = await page.locator("canvas").count();

  const returned = await page.evaluate(() => window.hireMaaz!());

  expect(returned).toContain("@");
  await expect(page.locator("canvas")).toHaveCount(before + 1);
});

test("the advertised commands all exist and answer", async ({ page }) => {
  await page.goto("/");

  const results = await page.evaluate(() => ({
    keys: Object.keys(window.qma!).sort(),
    help: window.qma!.help(),
    skills: window.qma!.skills(),
    projects: window.qma!.projects(),
    contact: window.qma!.contact(),
  }));

  expect(results.keys).toEqual([
    "contact",
    "help",
    "hire",
    "party",
    "projects",
    "resume",
    "skills",
  ]);
  expect(results.contact).toContain("@");
  for (const value of Object.values(results)) expect(value).toBeTruthy();
});

test("skips the confetti for anyone who asked for less motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await pageBehindIntro(page);
  const before = await page.locator("canvas").count();

  const lines = transcript(page);
  const returned = await page.evaluate(() => window.hireMaaz!());
  await page.waitForTimeout(300);

  expect(returned).toContain("@");
  expect(lines.join("\n")).not.toContain("threw confetti");
  await expect(page.locator("canvas")).toHaveCount(before);
});
