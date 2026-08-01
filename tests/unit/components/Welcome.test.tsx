import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Welcome } from "@/components/effects/Welcome";

/** Pretend the visitor's browser reports a given language. */
function speaks(language: string) {
  vi.spyOn(navigator, "language", "get").mockReturnValue(language);
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** Run the whole flash-and-hold budget. */
function playThrough() {
  act(() => {
    vi.advanceTimersByTime(8000);
  });
}

describe("Welcome", () => {
  it("lands on the visitor's own language", () => {
    speaks("fr-FR");
    render(<Welcome onDone={vi.fn()} />);

    playThrough();
    expect(screen.getByTestId("welcome")).toHaveAttribute(
      "data-settled",
      "true",
    );
    expect(screen.getByText("Bonjour")).toBeInTheDocument();
  });

  it("matches on the base tag, ignoring the region", () => {
    speaks("hi-IN");
    render(<Welcome onDone={vi.fn()} />);

    playThrough();
    expect(screen.getByText("नमस्ते")).toBeInTheDocument();
  });

  it("falls back to English for a language it doesn't know", () => {
    speaks("xh-ZA");
    render(<Welcome onDone={vi.fn()} />);

    playThrough();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("shows the greeting alone — no clock, no timezone", () => {
    speaks("en-US");
    render(<Welcome onDone={vi.fn()} />);

    playThrough();
    const panel = screen.getByTestId("welcome");
    expect(panel).toHaveTextContent("Hello");
    expect(panel).not.toHaveTextContent(/your time/i);
    expect(panel).not.toHaveTextContent(/bengaluru/i);
    expect(panel).not.toHaveTextContent(/good (morning|afternoon|evening)/i);
  });

  it("starts on a different language than it ends on", () => {
    speaks("en-US");
    render(<Welcome onDone={vi.fn()} />);

    expect(screen.getByTestId("welcome")).toHaveAttribute(
      "data-settled",
      "false",
    );
    expect(screen.queryByText("Hello")).not.toBeInTheDocument();
  });

  // The greeting hands off with the reveal still to play, so it finishes a
  // curtain's length short of the 6.5s the screen is on for overall.
  it("hands off once, leaving room for the reveal", () => {
    speaks("en-US");
    const onDone = vi.fn();
    render(<Welcome onDone={onDone} />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onDone).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(onDone).toHaveBeenCalledTimes(1);

    // And it doesn't keep firing afterwards.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("cleans up its timers on unmount", () => {
    speaks("en-US");
    const onDone = vi.fn();
    const { unmount } = render(<Welcome onDone={onDone} />);

    unmount();
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(onDone).not.toHaveBeenCalled();
  });
});
