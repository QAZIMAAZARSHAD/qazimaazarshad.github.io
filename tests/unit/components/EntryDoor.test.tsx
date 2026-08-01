import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntryDoor } from "@/components/effects/EntryDoor";

const DOOR = /enter the site/i;

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
  return {
    onEnter,
    buttonRef,
    door: screen.getByRole("button", { name: DOOR }),
  };
}

describe("EntryDoor", () => {
  it("invites the visitor in", () => {
    renderDoor();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Knock knock.",
    );
    expect(screen.getByRole("button", { name: DOOR })).toBeInTheDocument();
  });

  // The door is the only way in — if it can't be operated the site is
  // unreachable, so every path is pinned here.
  it("opens on click", () => {
    const { onEnter, door } = renderDoor();
    fireEvent.click(door);
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("opens on Enter and on Space", async () => {
    const user = userEvent.setup();
    const { onEnter, door } = renderDoor();

    door.focus();
    expect(door).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onEnter).toHaveBeenCalledTimes(1);

    await user.keyboard(" ");
    expect(onEnter).toHaveBeenCalledTimes(2);
  });

  it("names itself with the label it shows, so voice control can act on it", () => {
    const { door } = renderDoor();
    const name = door.getAttribute("aria-label") ?? "";
    // WCAG 2.5.3: the accessible name must contain the visible label.
    expect(screen.getByText("Come in")).toBeInTheDocument();
    expect(name.toLowerCase()).toContain("come in");
  });

  it("shows a focus ring rather than removing the outline outright", () => {
    const { door } = renderDoor();
    expect(door.className).toContain("focus-visible:ring-2");
    // Bare outline-none would leave a keyboard visitor with no indicator.
    expect(door.className).not.toMatch(/(^|\s)outline-none(\s|$)/);
  });

  it("exposes its button through the forwarded ref, so focus can be sent to it", () => {
    const { buttonRef } = renderDoor();
    expect(buttonRef.current).toBe(screen.getByRole("button", { name: DOOR }));
  });

  it("refuses a second press while it is already opening, without losing focus", () => {
    const { onEnter, door } = renderDoor({ opening: true });
    door.focus();

    fireEvent.click(door);

    expect(onEnter).not.toHaveBeenCalled();
    expect(door).toHaveAttribute("aria-disabled", "true");
    // Not `disabled`, which would drop focus onto <body> and eject a keyboard
    // visitor from the intro for the rest of it.
    expect(door).not.toBeDisabled();
    expect(door).toHaveFocus();
  });

  it("keeps hover and focus apart, so a mouse leaving doesn't unlight a focused door", () => {
    const { door } = renderDoor();
    const label = screen.getByText("Come in");

    fireEvent.mouseEnter(door);
    fireEvent.focus(door);
    expect(label.className).toContain("text-white");

    fireEvent.mouseLeave(door);
    expect(label.className).toContain("text-white");

    fireEvent.blur(door);
    expect(label.className).toContain("text-ink-400");
  });

  it("keeps the scenery out of the accessibility tree", () => {
    const { container } = render(
      <EntryDoor
        onEnter={vi.fn()}
        opening={false}
        buttonRef={createRef<HTMLButtonElement>()}
      />,
    );
    // The door panel and the light behind it are decoration; the heading and
    // the button are the only things assistive tech should meet.
    const panel = container.querySelector(".origin-left");
    expect(panel).toHaveAttribute("aria-hidden");
    expect(
      container.querySelectorAll("[aria-hidden='true']").length,
    ).toBeGreaterThanOrEqual(3);
  });
});
