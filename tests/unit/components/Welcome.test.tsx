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
    expect(screen.getByTestId("welcome")).toHaveTextContent("Bonjour");
  });

  it("matches on the base tag, ignoring the region", () => {
    speaks("hi-IN");
    render(<Welcome onDone={vi.fn()} />);

    playThrough();
    expect(screen.getByTestId("welcome")).toHaveTextContent("नमस्ते");
  });

  it("falls back to English for a language it doesn't know", () => {
    speaks("xh-ZA");
    render(<Welcome onDone={vi.fn()} />);

    playThrough();
    expect(screen.getByTestId("welcome")).toHaveTextContent("Hello");
  });

  // A language tag that resolves against Object.prototype would otherwise
  // hand React something that isn't a greeting at all.
  it("survives a language tag that collides with Object.prototype", () => {
    speaks("constructor");
    expect(() => render(<Welcome onDone={vi.fn()} />)).not.toThrow();

    playThrough();
    expect(screen.getByTestId("welcome")).toHaveTextContent("Hello");
  });

  it("tags each greeting with its language and direction", () => {
    speaks("ar-EG");
    render(<Welcome onDone={vi.fn()} />);

    playThrough();
    const arabic = screen
      .getByTestId("welcome")
      .querySelector('[lang="ar"][dir="rtl"]');
    expect(arabic).not.toBeNull();
    expect(arabic).toHaveTextContent("مرحبا");
  });

  it("hides the flash from assistive tech and announces only what it lands on", () => {
    speaks("en-US");
    render(<Welcome onDone={vi.fn()} />);

    // Mid-flash the live region is empty, so nothing is narrated per frame.
    const status = screen.getByRole("status");
    expect(status).toBeEmptyDOMElement();

    playThrough();
    expect(status).toHaveTextContent("Hello");
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
