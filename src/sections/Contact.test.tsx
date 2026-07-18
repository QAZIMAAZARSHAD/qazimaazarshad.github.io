import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Contact } from "@/sections/Contact";
import { profile } from "@/data/content";

const writeText = vi.fn();

beforeEach(() => {
  writeText.mockReset();
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
});

describe("Contact", () => {
  it("shows the email and a mailto 'Say hello' link", () => {
    render(<Contact />);

    const sayHello = screen.getByRole("link", { name: /say hello/i });
    expect(sayHello).toHaveAttribute("href", `mailto:${profile.email}`);

    const emailLink = screen.getByRole("link", { name: profile.email });
    expect(emailLink).toHaveAttribute("href", `mailto:${profile.email}`);
  });

  it("copies the email to the clipboard and flashes a copied state", async () => {
    render(<Contact />);

    const copyButton = screen.getByRole("button", {
      name: `Copy email address ${profile.email}`,
    });

    // fireEvent (not userEvent) so userEvent's own clipboard stub doesn't
    // shadow our navigator.clipboard.writeText mock.
    fireEvent.click(copyButton);

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(profile.email),
    );
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Copied!")).toBeInTheDocument();
  });
});
