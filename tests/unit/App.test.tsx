import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import App from "@/App";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

/** Walk the real entry flow: loader → open the door → skip the greeting. */
function enterSite() {
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: /enter the site/i }));
  });
  // The door flies the camera through before handing over to the greeting,
  // and only the greeting can be skipped.
  act(() => {
    vi.advanceTimersByTime(1200);
  });
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
    enterSite();

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

    enterSite();

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
