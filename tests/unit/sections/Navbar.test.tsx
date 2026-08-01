import { describe, it, expect, afterEach } from "vitest";
import { render, screen, within, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "@/sections/Navbar";
import { navSections } from "@/data/content";

/** Drive the window scroll position the header listens to. */
function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, writable: true });
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

afterEach(() => scrollTo(0));

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

  it("docks into the floating bar once the page scrolls", () => {
    render(<Navbar />);
    const dock = screen.getByTestId("nav-dock");

    expect(dock).toHaveAttribute("data-docked", "false");
    scrollTo(200);
    expect(dock).toHaveAttribute("data-docked", "true");
    scrollTo(0);
    expect(dock).toHaveAttribute("data-docked", "false");
  });

  it("returns to the expanded bar while the mobile drawer is open", async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    const dock = screen.getByTestId("nav-dock");

    scrollTo(200);
    expect(dock).toHaveAttribute("data-docked", "true");

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(dock).toHaveAttribute("data-docked", "false");
  });

  it("glides the indicator to the hovered link and releases it on leave", () => {
    render(<Navbar />);
    const list = screen.getByRole("navigation", { name: "Primary" });
    const projects = within(list).getByRole("link", { name: "Projects" });

    // The scroll-spy never fires under jsdom, so nothing is highlighted yet.
    expect(screen.queryByTestId("nav-indicator")).not.toBeInTheDocument();

    fireEvent.mouseEnter(projects);
    expect(projects).toContainElement(screen.getByTestId("nav-indicator"));

    fireEvent.mouseLeave(projects.closest("ul") as HTMLElement);
    expect(screen.queryByTestId("nav-indicator")).not.toBeInTheDocument();
  });

  it("does not let a click pin the indicator to a link", () => {
    render(<Navbar />);
    const list = screen.getByRole("navigation", { name: "Primary" });
    const skills = within(list).getByRole("link", { name: "Skills" });

    // Focus from a pointer click is not `:focus-visible`, so it must not
    // strand the indicator on that link while the page scrolls on.
    fireEvent.focus(skills);
    expect(screen.queryByTestId("nav-indicator")).not.toBeInTheDocument();
  });

  it("keeps a keyboard-focused link lit when the pointer leaves another one", () => {
    render(<Navbar />);
    const list = screen.getByRole("navigation", { name: "Primary" });
    const skills = within(list).getByRole("link", { name: "Skills" });
    const projects = within(list).getByRole("link", { name: "Projects" });

    fireEvent.mouseEnter(projects);
    expect(projects).toContainElement(screen.getByTestId("nav-indicator"));

    // Blurring a link must not wipe a highlight the pointer still owns.
    fireEvent.blur(skills);
    expect(projects).toContainElement(screen.getByTestId("nav-indicator"));
  });

  it("marks only the active section with aria-current", () => {
    render(<Navbar />);
    const list = screen.getByRole("navigation", { name: "Primary" });
    const projects = within(list).getByRole("link", { name: "Projects" });

    fireEvent.mouseEnter(projects);
    // Hovering lights the indicator but must not claim to be the current page.
    expect(projects).not.toHaveAttribute("aria-current");
  });
});
