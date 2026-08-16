import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import {
  LoaderStage,
  HOLD_MS,
  progressAt,
} from "@/components/effects/LoaderStage";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/** Step the clock in slices so each chained timer gets its own flush. */
function runClock(total: number, slice = 250) {
  for (let elapsed = 0; elapsed < total; elapsed += slice) {
    act(() => {
      vi.advanceTimersByTime(slice);
    });
  }
}

describe("progressAt", () => {
  it("runs the ring to full over the hold once the page is ready", () => {
    expect(progressAt(0, true)).toBe(0);
    expect(progressAt(HOLD_MS / 2, true)).toBeCloseTo(0.5);
    expect(progressAt(HOLD_MS, true)).toBe(1);
  });

  it("never finishes on time alone while the page is still coming in", () => {
    expect(progressAt(HOLD_MS, false)).toBeLessThan(1);
    expect(progressAt(HOLD_MS * 4, false)).toBeLessThan(1);
    expect(progressAt(HOLD_MS * 100, false)).toBeLessThan(1);
  });

  it("keeps creeping on a slow connection rather than sitting frozen", () => {
    const atHold = progressAt(HOLD_MS, false);
    const later = progressAt(HOLD_MS + 3000, false);
    expect(later).toBeGreaterThan(atHold);
  });

  it("cannot go backwards as time passes", () => {
    for (const ready of [true, false]) {
      let previous = -1;
      for (let t = 0; t <= HOLD_MS * 5; t += 100) {
        const p = progressAt(t, ready);
        expect(p).toBeGreaterThanOrEqual(previous);
        previous = p;
      }
    }
  });
});

describe("LoaderStage", () => {
  it("stays up for the whole hold even when the page is ready at once", () => {
    const done = vi.fn();
    render(<LoaderStage onDone={done} />);

    runClock(HOLD_MS - 500);
    expect(done).not.toHaveBeenCalled();

    runClock(2_000);
    expect(done).toHaveBeenCalledTimes(1);
  });

  it("counts up and says what it is doing", () => {
    render(<LoaderStage onDone={vi.fn()} />);
    expect(screen.getByText("Loading")).toBeInTheDocument();

    runClock(HOLD_MS / 2);
    const shown = Number(screen.getByTestId("loader-count").textContent);
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThanOrEqual(100);
  });

  it("gives up on a load event that never arrives", () => {
    // readyState is stuck short of complete, so nothing ever settles.
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
    const done = vi.fn();
    render(<LoaderStage onDone={done} />);

    runClock(HOLD_MS * 2);
    expect(done).not.toHaveBeenCalled();

    runClock(20_000);
    expect(done).toHaveBeenCalledTimes(1);
  });
});
