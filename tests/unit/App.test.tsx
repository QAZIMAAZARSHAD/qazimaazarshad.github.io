import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import App from "@/App";

/** The intro covers the page until dismissed; any key cuts through it. */
function skipIntro() {
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  });
}

/**
 * Full-tree smoke test: mounts every section, the navbar, and the always-on
 * effect/widget layers together to catch render-time crashes and integration
 * regressions across the app shell.
 */
describe("App", () => {
  it("mounts the whole page without crashing", () => {
    render(<App />);
    skipIntro();

    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  // The intro paints over the page, so the page has to leave the accessibility
  // tree too — otherwise a screen reader can browse content nobody can see.
  it("keeps the page out of reach until the intro finishes", () => {
    const { container } = render(<App />);

    const main = container.querySelector("main") as HTMLElement;
    expect(main).toHaveAttribute("aria-hidden", "true");
    expect(main.inert).toBe(true);

    skipIntro();

    expect(main).not.toHaveAttribute("aria-hidden");
    expect(main.inert).toBe(false);
  });

  it("renders all primary section landmarks", () => {
    const { container } = render(<App />);
    for (const id of [
      "about",
      "experience",
      "earlier",
      "projects",
      "skills",
      "education",
      "achievements",
      "certifications",
      "hobbies",
      "contact",
    ]) {
      expect(container.querySelector(`#${id}`), `#${id}`).not.toBeNull();
    }
  });
});
