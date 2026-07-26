import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CountUp } from "@/components/ui/CountUp";

const realMatchMedia = window.matchMedia;

/** Force prefers-reduced-motion so CountUp snaps to its final value synchronously. */
function preferReducedMotion() {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("reduce"),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  window.matchMedia = realMatchMedia;
});

describe("CountUp", () => {
  it("snaps to the final value when reduced motion is preferred", () => {
    preferReducedMotion();
    render(<CountUp value={49} />);
    expect(screen.getByText("49")).toBeInTheDocument();
  });

  it("renders the prefix and suffix around a locale-formatted value", () => {
    preferReducedMotion();
    render(<CountUp value={1200} prefix="~" suffix="+" />);
    expect(screen.getByText("~1,200+")).toBeInTheDocument();
  });
});
