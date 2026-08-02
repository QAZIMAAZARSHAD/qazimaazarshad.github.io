import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DoorRoom } from "@/components/effects/DoorRoom";

const room = (overrides: Partial<Parameters<typeof DoorRoom>[0]> = {}) =>
  render(
    <DoorRoom
      opening={false}
      reduceMotion={false}
      flightSeconds={0.78}
      {...overrides}
    />,
  );

describe("DoorRoom", () => {
  // A flat panel of light gave the camera nothing to fly through; the corridor
  // and the mark at the end of it are the whole point of the shot.
  it("puts a corridor and the monogram beyond the door", () => {
    const { container } = room();
    expect(screen.getByText("QMA")).toBeInTheDocument();
    expect(container.querySelectorAll(".rounded-xl").length).toBeGreaterThan(3);
  });

  it("is scenery, not content", () => {
    const { container } = room();
    // One aria-hidden wrapper is enough: it hides the whole subtree, and the
    // door's own button carries the accessible name.
    expect(container.firstElementChild).toHaveAttribute("aria-hidden");
    expect(screen.queryByRole("img")).toBeNull();
  });

  // Driven by rerendering a mounted room rather than mounting three: with
  // initial={false} a fresh mount jumps straight to its target, which can't
  // tell "parked at rest" from "parked at the end of the flight".
  it("travels when the door opens, and not when motion is reduced", async () => {
    const corridor = (view: ReturnType<typeof render>) =>
      view.container.querySelector<HTMLElement>('[data-testid="door-corridor"]')
        ?.style.transform ?? "";

    const view = room({ opening: false, reduceMotion: false });
    const parked = corridor(view);

    view.rerender(
      <DoorRoom opening reduceMotion={false} flightSeconds={0.78} />,
    );
    // Polled, because the transform is written frame by frame rather than on
    // the rerender itself. Guards against the comparison being empty-vs-empty,
    // which is how this test once passed while watching a static element.
    await waitFor(() => expect(corridor(view)).toMatch(/scale/), {
      timeout: 4000,
    });
    expect(corridor(view)).not.toBe(parked);

    const reduced = room({ opening: false, reduceMotion: true });
    const before = corridor(reduced);
    reduced.rerender(<DoorRoom opening reduceMotion flightSeconds={0.78} />);
    // Given the same chance to move, it doesn't.
    await new Promise((r) => setTimeout(r, 120));
    expect(corridor(reduced), "opening changes nothing").toBe(before);
  });
});
