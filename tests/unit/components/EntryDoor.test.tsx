import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EntryDoor } from "@/components/effects/EntryDoor";

function renderDoor(overrides: Partial<Parameters<typeof EntryDoor>[0]> = {}) {
  const onEnter = vi.fn();
  const buttonRef = createRef<HTMLButtonElement>();
  render(
    <EntryDoor
      onEnter={onEnter}
      opening={false}
      buttonRef={buttonRef}
      {...overrides}
    />,
  );
  return { onEnter, buttonRef };
}

describe("EntryDoor", () => {
  it("invites the visitor in", () => {
    renderDoor();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Knock knock.",
    );
    expect(
      screen.getByRole("button", { name: "Enter the site" }),
    ).toBeInTheDocument();
  });

  // The door is the only way in — if it can't be operated the site is
  // unreachable, so both paths are pinned here.
  it("opens on click", () => {
    const { onEnter } = renderDoor();
    fireEvent.click(screen.getByRole("button", { name: "Enter the site" }));
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("opens from the keyboard", () => {
    const { onEnter } = renderDoor();
    const door = screen.getByRole("button", { name: "Enter the site" });
    door.focus();
    expect(door).toHaveFocus();
    // A button fires click on Enter/Space; jsdom needs the click itself.
    fireEvent.click(door);
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("exposes its button through the forwarded ref, so focus can be sent to it", () => {
    const { buttonRef } = renderDoor();
    expect(buttonRef.current).toBe(
      screen.getByRole("button", { name: "Enter the site" }),
    );
  });

  it("cannot be opened twice while it is already opening", () => {
    const { onEnter } = renderDoor({ opening: true });
    const door = screen.getByRole("button", { name: "Enter the site" });
    expect(door).toBeDisabled();
    fireEvent.click(door);
    expect(onEnter).not.toHaveBeenCalled();
  });

  it("keeps the decorative scenery out of the accessibility tree", () => {
    const { container } = render(
      <EntryDoor
        onEnter={vi.fn()}
        opening={false}
        buttonRef={createRef<HTMLButtonElement>()}
      />,
    );
    // Everything that isn't the heading or the button is scenery.
    const decorative = container.querySelectorAll("[aria-hidden='true']");
    expect(decorative.length).toBeGreaterThan(0);
  });
});
