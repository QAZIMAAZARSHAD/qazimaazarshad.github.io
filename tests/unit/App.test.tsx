import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import App from "@/App";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

/**
 * Step the clock until `done()` holds. The loader hands over on whichever of
 * the load event, its minimum display, or the stalled-load net comes first, and
 * it measures with real time — so a fixed jump assumes one particular path.
 */
function advanceUntil(done: () => boolean, budget = 12_000) {
  for (let elapsed = 0; elapsed < budget && !done(); elapsed += 250) {
    act(() => {
      vi.advanceTimersByTime(250);
    });
  }
  if (!done()) throw new Error("intro did not reach the expected state");
}

/** Walk the real entry flow: loader → open the door → skip the greeting. */
function enterSite() {
  advanceUntil(
    () =>
      screen.queryAllByRole("button", { name: /enter the site/i }).length > 0,
  );
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: /enter the site/i }));
  });

  // The door flies the camera through before handing over to the greeting, and
  // only the greeting can be skipped — pressing Escape at the door does nothing.
  advanceUntil(() => screen.queryAllByTestId("welcome").length > 0);
  act(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  });
  // Not waiting for the overlay to leave the DOM: its exit animation never
  // finishes under jsdom. The page is released the moment the intro is done,
  // which is what these tests are about.
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
    expect(
      screen.getByRole("link", { name: /skip to content/i }),
    ).toHaveAttribute("href", "#main");
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
