import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
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

  it("hides the native cursor only after the pointer moves, and restores it on unmount", () => {
    mockMatchMedia(["pointer: fine"]);
    const html = document.documentElement;
    const { unmount } = render(<CustomCursor />);

    // On mount the native cursor is untouched (avoids a no-cursor flash).
    expect(html.classList.contains("qma-cursor-active")).toBe(false);

    act(() => {
      window.dispatchEvent(
        new MouseEvent("mousemove", { clientX: 40, clientY: 40 }),
      );
    });
    expect(html.classList.contains("qma-cursor-active")).toBe(true);

    // Teardown must never strand the document with `cursor: none`.
    unmount();
    expect(html.classList.contains("qma-cursor-active")).toBe(false);
  });
});
