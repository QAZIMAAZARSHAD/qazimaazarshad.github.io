import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";

/** Stub matchMedia so a given query set resolves to `matches: true`. */
function mockMatchMedia(trueQueries: string[]) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: trueQueries.some((q) => query.includes(q)),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
        onchange: null,
      }) as unknown as MediaQueryList,
  );
}

/**
 * The backdrop is three full-screen discs under a 120px blur. Moving one makes
 * the compositor re-run that blur every frame, which is what left the page
 * stalled on iOS Safari — so on a touchscreen they have to render still.
 */
describe("AnimatedBackground", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  const blobs = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('[class*="blur-[120px]"]'));

  it("drifts the blurred blobs on a fine pointer", () => {
    mockMatchMedia(["pointer: fine"]);
    const { container } = render(<AnimatedBackground />);

    const drifting = blobs(container);
    expect(drifting).toHaveLength(3);
    for (const blob of drifting) {
      expect(blob.className).toContain("animate-float");
    }
  });

  it("parks them on a touchscreen", () => {
    mockMatchMedia([]); // coarse pointer, motion allowed
    const { container } = render(<AnimatedBackground />);

    const parked = blobs(container);
    // Still painted — this is about what moves, not what shows.
    expect(parked).toHaveLength(3);
    for (const blob of parked) {
      expect(blob.className).not.toContain("animate-float");
    }
  });

  // Reduced motion comes in through Framer's own media subscription rather
  // than `matchMedia` at render time, so it is covered by the visual e2e run,
  // which drives the whole page under `prefers-reduced-motion`.

  it("leaves the cursor-driven particle canvas idle on a touchscreen", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame");

    mockMatchMedia([]);
    render(<AnimatedBackground />);
    expect(raf).not.toHaveBeenCalled();

    raf.mockRestore();
  });
});
