import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { CustomCursor } from "@/components/effects/CustomCursor";

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

describe("CustomCursor", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("renders the dot + trailing ring layer on a fine pointer with motion allowed", () => {
    mockMatchMedia(["pointer: fine"]);
    const { container } = render(<CustomCursor />);
    expect(container.querySelector(".qma-cursor-layer")).not.toBeNull();
    expect(container.querySelector(".qma-cursor-dot")).not.toBeNull();
    expect(container.querySelector(".qma-cursor-ring")).not.toBeNull();
  });

  it("renders nothing under prefers-reduced-motion", () => {
    mockMatchMedia(["pointer: fine", "prefers-reduced-motion"]);
    const { container } = render(<CustomCursor />);
    expect(container.querySelector(".qma-cursor-layer")).toBeNull();
  });

  it("renders nothing on a coarse (touch) pointer", () => {
    mockMatchMedia([]); // neither fine pointer nor reduced motion
    const { container } = render(<CustomCursor />);
    expect(container.querySelector(".qma-cursor-layer")).toBeNull();
  });
});
