import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import {
  IntroProvider,
  useHasEntered,
  useMarkEntered,
} from "@/components/effects/IntroProvider";

function Probe() {
  return <span data-testid="state">{String(useHasEntered())}</span>;
}

function Opener() {
  const markEntered = useMarkEntered();
  return (
    <button type="button" onClick={markEntered}>
      open
    </button>
  );
}

const state = () => screen.getByTestId("state").textContent;

describe("IntroProvider", () => {
  // The page mounts behind the intro overlay, so anything rendered without the
  // provider — a section under test, say — has to be told it is already on
  // screen rather than waiting forever for a signal that never comes.
  it("reports entered when no provider is above it", () => {
    render(<Probe />);
    expect(state()).toBe("true");
  });

  it("holds the page back until the intro says so", () => {
    render(
      <IntroProvider>
        <Probe />
        <Opener />
      </IntroProvider>,
    );

    expect(state()).toBe("false");
    act(() => screen.getByRole("button", { name: "open" }).click());
    expect(state()).toBe("true");
  });
});
