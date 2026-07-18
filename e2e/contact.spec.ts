import { test, expect } from "@playwright/test";

test.describe("Contact section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
  });

  test('"Say hello" is a mailto link', async ({ page }) => {
    const sayHello = page
      .locator("#contact")
      .getByRole("link", { name: "Say hello" });

    await expect(sayHello).toBeVisible();
    await expect(sayHello).toHaveAttribute("href", /^mailto:/);
  });

  test('"Copy email" flashes a copied confirmation', async ({ page }) => {
    const contact = page.locator("#contact");
    const copyButton = contact.getByRole("button", { name: /copy email/i });

    await expect(copyButton).toBeVisible();
    await copyButton.click();

    // The button switches to its confirmed state regardless of whether the
    // Clipboard API is permitted (the component flashes state either way).
    await expect(contact.getByRole("button", { name: /copied/i })).toBeVisible();
    await expect(contact.getByText("Copied!")).toBeVisible();
  });

  test("social links row renders with valid hrefs", async ({ page }) => {
    const contact = page.locator("#contact");

    const socials: ReadonlyArray<{ name: string; href: RegExp }> = [
      { name: "LinkedIn", href: /^https:\/\/(www\.)?linkedin\.com\// },
      { name: "GitHub", href: /^https:\/\/github\.com\// },
      { name: "Instagram", href: /^https:\/\/(www\.)?instagram\.com\// },
      { name: "Email", href: /^mailto:/ },
    ];

    for (const { name, href } of socials) {
      const link = contact.getByRole("link", { name });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", href);
    }
  });
});
