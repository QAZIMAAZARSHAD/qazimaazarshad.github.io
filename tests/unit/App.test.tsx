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

/**
 * Let the frames pass that the page body waits on. It mounts behind the intro
 * rather than alongside it, so that the first paint is one dial instead of the
 * whole site.
 */
function paint() {
  act(() => {
    vi.advanceTimersByTime(50);
  });
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
  // Fake timers + the full entry walk (loader → door → greeting) need more
  // than Vitest's 5s default under a busy CI runner.
  it("mounts the whole page without crashing", { timeout: 15_000 }, () => {
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
  it(
    "keeps the page out of reach until the intro finishes",
    { timeout: 15_000 },
    () => {
      const { container } = render(<App />);
      paint();

      const main = container.querySelector("main") as HTMLElement;
      expect(main).toHaveAttribute("aria-hidden", "true");
      expect(main.inert).toBe(true);

      enterSite();

      expect(main).not.toHaveAttribute("aria-hidden");
      expect(main.inert).toBe(false);
    },
  );

  // Regression: the loader used to start its count on mount, which on a slow
  // phone was several seconds after the page was asked for — so its first
  // painted frame was already at 100%. The intro has to reach the screen on its
  // own, ahead of everything it covers.
  it("raises the intro before mounting the page behind it", () => {
    const { container } = render(<App />);

    expect(screen.getByTestId("preloader")).toBeInTheDocument();
    expect(container.querySelector("main")).toBeNull();

    paint();
    expect(container.querySelector("main")).not.toBeNull();
  });

  it("renders all primary section landmarks", () => {
    const { container } = render(<App />);
    paint();
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
