import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "@/sections/Navbar";
import { navSections } from "@/data/content";

describe("Navbar", () => {
  it("renders a nav link for each section", () => {
    render(<Navbar />);

    for (const section of navSections) {
      const link = screen.getByRole("link", { name: section.label });
      expect(link).toHaveAttribute("href", `#${section.id}`);
    }
  });

  it("toggles the mobile drawer and exposes it via aria-expanded", async () => {
    const user = userEvent.setup();
    const { container } = render(<Navbar />);

    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "mobile-menu");
    expect(container.querySelector("#mobile-menu")).toBeNull();

    await user.click(toggle);

    const reToggle = screen.getByRole("button", { name: "Close menu" });
    expect(reToggle).toHaveAttribute("aria-expanded", "true");

    const drawer = container.querySelector("#mobile-menu");
    expect(drawer).not.toBeNull();
    for (const section of navSections) {
      expect(
        within(drawer as HTMLElement).getByRole("link", {
          name: section.label,
        }),
      ).toHaveAttribute("href", `#${section.id}`);
    }

    await user.click(reToggle);
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
