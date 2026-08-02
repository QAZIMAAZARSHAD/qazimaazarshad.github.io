import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
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

  it("travels only when motion is allowed", () => {
    // Scoped to each render's own container: three rooms share document.body,
    // so a global query would match all of them.
    const corridor = (view: ReturnType<typeof render>) =>
      view.container.querySelector<HTMLElement>('[data-testid="door-corridor"]')
        ?.style.transform ?? "";

    const parked = corridor(room({ opening: false, reduceMotion: false }));
    const flying = corridor(room({ opening: true, reduceMotion: false }));
    const still = corridor(room({ opening: true, reduceMotion: true }));

    // Guard against the whole comparison being empty-vs-empty, which is how
    // this test previously passed while watching the wrong element.
    expect(flying).toMatch(/scale/);
    expect(flying).not.toBe(parked);
    // Opening under reduced motion looks exactly like sitting still.
    expect(still).toBe(parked);
  });
});
