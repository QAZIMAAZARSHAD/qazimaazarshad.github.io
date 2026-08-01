import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Welcome } from "@/components/effects/Welcome";

/** Pretend the visitor's browser is in a given language and UTC offset. */
function asVisitor({
  language,
  offsetMinutes,
}: {
  language: string;
  offsetMinutes: number;
}) {
  vi.spyOn(navigator, "language", "get").mockReturnValue(language);
  // getTimezoneOffset is minutes *behind* UTC, i.e. the negation of the offset.
  vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(-offsetMinutes);
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** Run the whole 6.5s budget. */
function playThrough() {
  act(() => {
    vi.advanceTimersByTime(8000);
  });
}

describe("Welcome", () => {
  it("lands on the visitor's own language", () => {
    asVisitor({ language: "fr-FR", offsetMinutes: 60 });
    render(<Welcome onDone={vi.fn()} />);

    playThrough();
    expect(screen.getByTestId("welcome")).toHaveAttribute(
      "data-settled",
      "true",
    );
    expect(screen.getByText("Bonjour")).toBeInTheDocument();
  });

  it("falls back to English for a language it doesn't know", () => {
    asVisitor({ language: "xh-ZA", offsetMinutes: 120 });
    render(<Welcome onDone={vi.fn()} />);

    playThrough();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("tells an overseas visitor how far Bengaluru is", () => {
    // New York in winter: UTC-5. IST is +5:30, so Bengaluru is 10h30m ahead.
    asVisitor({ language: "en-US", offsetMinutes: -300 });
    render(<Welcome onDone={vi.fn()} />);

    playThrough();
    expect(screen.getByText(/Bengaluru is 10h 30m ahead/)).toBeInTheDocument();
  });

  it("reports the other direction for a visitor ahead of IST", () => {
    // Tokyo: UTC+9 → Bengaluru is 3h30m behind.
    asVisitor({ language: "ja-JP", offsetMinutes: 540 });
    render(<Welcome onDone={vi.fn()} />);

    playThrough();
    expect(screen.getByText(/Bengaluru is 3h 30m behind/)).toBeInTheDocument();
  });

  it("omits the distance line for a visitor already in IST", () => {
    asVisitor({ language: "hi-IN", offsetMinutes: 330 });
    render(<Welcome onDone={vi.fn()} />);

    playThrough();
    expect(screen.queryByText(/Bengaluru is/)).not.toBeInTheDocument();
    expect(screen.getByText("नमस्ते")).toBeInTheDocument();
  });

  it("always shows the visitor's local time", () => {
    asVisitor({ language: "en-GB", offsetMinutes: 0 });
    render(<Welcome onDone={vi.fn()} />);

    playThrough();
    expect(screen.getByText(/your time/i)).toBeInTheDocument();
  });

  // The greeting hands off with the reveal still to play, so it finishes a
  // curtain's length short of the 6.5s the screen is on for overall.
  it("hands off once, leaving room for the reveal", () => {
    asVisitor({ language: "en-US", offsetMinutes: 330 });
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
    asVisitor({ language: "en-US", offsetMinutes: 330 });
    const onDone = vi.fn();
    const { unmount } = render(<Welcome onDone={onDone} />);

    unmount();
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(onDone).not.toHaveBeenCalled();
  });
});
