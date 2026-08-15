import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { Preloader } from "@/components/effects/Preloader";
import { HOLD_MS } from "@/components/effects/LoaderStage";

/**
 * The door exists so the visitor's click can start the music — browsers refuse
 * audible playback without a gesture. These pin that it actually happens, and
 * at the level we intend.
 */
class FakeAudio {
  static instances: FakeAudio[] = [];
  volume = 1;
  muted = false;
  preload = "";
  playCalls = 0;
  paused = true;
  readonly src: string;

  constructor(src: string) {
    this.src = src;
    FakeAudio.instances.push(this);
  }

  play() {
    this.playCalls += 1;
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }
}

const track = () => FakeAudio.instances[0];
const door = () => screen.getByRole("button", { name: /enter the site/i });

beforeEach(() => {
  FakeAudio.instances = [];
  vi.stubGlobal("Audio", FakeAudio);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/**
 * Step the clock in slices. The intro's phases chain off one another, and each
 * act() boundary flushes one link of that chain — a single large advance would
 * leave the rest pending.
 */
function runClock(total: number, slice = 500) {
  for (let elapsed = 0; elapsed < total; elapsed += slice) {
    act(() => {
      vi.advanceTimersByTime(slice);
    });
  }
}

/** Run the loader out, hold and all, so the door is on screen. */
function toDoor() {
  render(<Preloader />);
  runClock(HOLD_MS + 2_000);
}

describe("Preloader audio", () => {
  it("buffers the track while the loader and door are up", () => {
    toDoor();
    expect(track()).toBeDefined();
    expect(track().src).toContain("audio/intro.mp3");
    expect(track().preload).toBe("auto");
    // Buffered, not playing — the browser would refuse it anyway.
    expect(track().playCalls).toBe(0);
  });

  it("starts the track when the door is opened, unmuted and at full volume", () => {
    toDoor();
    fireEvent.click(door());

    expect(track().playCalls).toBe(1);
    expect(track().muted).toBe(false);
    expect(track().volume).toBe(1);
  });

  it("fades the track out rather than cutting it dead", () => {
    toDoor();
    fireEvent.click(door());
    expect(track().paused).toBe(false);

    // Through the door, the greeting, and out the other side.
    runClock(15_000);

    expect(track().volume).toBeLessThan(1);
    expect(track().paused).toBe(true);
  });

  it("survives an environment with no media support", () => {
    class DeadAudio extends FakeAudio {
      override play(): Promise<void> {
        throw new Error("no media support");
      }
    }
    vi.stubGlobal("Audio", DeadAudio);

    toDoor();
    expect(() => fireEvent.click(door())).not.toThrow();
    // The intro carries on to the greeting regardless.
    runClock(2_000);
    expect(screen.getByTestId("welcome")).toBeInTheDocument();
  });
});
