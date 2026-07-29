import { describe, it, expect, afterEach, vi } from "vitest";
import { playStrum } from "@/lib/sound";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("playStrum", () => {
  // Runs first, while the module's lazy AudioContext is still uninitialised.
  it("does not throw when Web Audio is unavailable", () => {
    vi.stubGlobal("AudioContext", undefined);
    vi.stubGlobal("webkitAudioContext", undefined);
    expect(() => playStrum()).not.toThrow();
  });

  it("plucks one buffer source per guitar string", () => {
    const started: number[] = [];
    const chain = () => {
      const node = { connect: vi.fn(() => node) };
      return node;
    };
    const param = () => ({
      value: 0,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    });

    class FakeAudioContext {
      sampleRate = 8000;
      currentTime = 0;
      state = "running";
      destination = {};
      resume = vi.fn();
      createGain = vi.fn(() => ({ gain: param(), ...chain() }));
      createBiquadFilter = vi.fn(() => ({
        type: "",
        frequency: { value: 0 },
        ...chain(),
      }));
      createBuffer = vi.fn((_c: number, len: number) => ({
        getChannelData: () => new Float32Array(len),
      }));
      createBufferSource = vi.fn(() => ({
        buffer: null,
        connect: vi.fn(() => chain()),
        start: vi.fn((t: number) => started.push(t)),
        stop: vi.fn(),
      }));
    }
    vi.stubGlobal("AudioContext", FakeAudioContext);

    playStrum();

    // Six open strings, strummed at non-decreasing times.
    expect(started).toHaveLength(6);
    expect(started).toEqual([...started].sort((a, b) => a - b));
  });
});
