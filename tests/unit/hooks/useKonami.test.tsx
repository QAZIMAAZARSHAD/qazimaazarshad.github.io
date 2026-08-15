import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { useKonami } from "@/hooks/useKonami";

const CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

function Probe({ onUnlock }: { readonly onUnlock: () => void }) {
  useKonami(onUnlock);
  return <input aria-label="search" />;
}

function type(keys: readonly string[], target: EventTarget = window) {
  for (const key of keys) {
    target.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
    );
  }
}

describe("useKonami", () => {
  it("fires on the full sequence", () => {
    const onUnlock = vi.fn();
    render(<Probe onUnlock={onUnlock} />);

    type(CODE);

    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it("accepts the letters in either case", () => {
    const onUnlock = vi.fn();
    render(<Probe onUnlock={onUnlock} />);

    type([...CODE.slice(0, 8), "B", "A"]);

    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it("stays quiet on a near miss", () => {
    const onUnlock = vi.fn();
    render(<Probe onUnlock={onUnlock} />);

    type([...CODE.slice(0, 9), "x"]);

    expect(onUnlock).not.toHaveBeenCalled();
  });

  it("restarts mid-run rather than needing a clean slate", () => {
    const onUnlock = vi.fn();
    render(<Probe onUnlock={onUnlock} />);

    // A false start, then the real thing without any reset in between.
    type(["ArrowUp", "ArrowRight"]);
    type(CODE);

    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it("can be entered twice in a row", () => {
    const onUnlock = vi.fn();
    render(<Probe onUnlock={onUnlock} />);

    type(CODE);
    type(CODE);

    expect(onUnlock).toHaveBeenCalledTimes(2);
  });

  it("ignores keys typed into a field, so search terms cannot trigger it", () => {
    const onUnlock = vi.fn();
    const { getByLabelText } = render(<Probe onUnlock={onUnlock} />);

    type(CODE, getByLabelText("search"));

    expect(onUnlock).not.toHaveBeenCalled();
  });
});
