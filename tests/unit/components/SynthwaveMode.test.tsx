import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SynthwaveMode } from "@/components/effects/SynthwaveMode";
import { SYNTHWAVE_EVENT } from "@/lib/synthwave";

const startChiptune = vi.fn();
const stopChiptune = vi.fn();

vi.mock("@/lib/chiptune", () => ({
  startChiptune: () => startChiptune(),
  stopChiptune: () => stopChiptune(),
}));

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

function konami() {
  act(() => {
    for (const key of CODE) {
      window.dispatchEvent(new KeyboardEvent("keydown", { key }));
    }
  });
}

function fire() {
  act(() => {
    window.dispatchEvent(new CustomEvent(SYNTHWAVE_EVENT));
  });
}

const isOn = () => document.documentElement.dataset.synthwave !== undefined;

beforeEach(() => {
  startChiptune.mockClear();
  stopChiptune.mockClear();
});

afterEach(() => {
  delete document.documentElement.dataset.synthwave;
});

describe("SynthwaveMode", () => {
  it("stays out of the way until the code is entered", () => {
    render(<SynthwaveMode />);

    expect(isOn()).toBe(false);
    expect(screen.queryByTestId("synthwave-overlay")).not.toBeInTheDocument();
    expect(startChiptune).not.toHaveBeenCalled();
  });

  it("turns the whole page over on the Konami code", () => {
    render(<SynthwaveMode />);

    konami();

    expect(isOn()).toBe(true);
    expect(screen.getByTestId("synthwave-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("synthwave-scenery")).toBeInTheDocument();
    expect(startChiptune).toHaveBeenCalled();
  });

  it("announces itself, since the change is purely visual otherwise", () => {
    render(<SynthwaveMode />);
    konami();

    expect(screen.getByRole("status")).toHaveTextContent(/synthwave mode on/i);
  });

  it("goes back to normal on a second run of the code", () => {
    render(<SynthwaveMode />);

    konami();
    konami();

    expect(isOn()).toBe(false);
    expect(stopChiptune).toHaveBeenCalled();
  });

  it("can be driven by the palette and the console without the keyboard", () => {
    render(<SynthwaveMode />);

    fire();
    expect(isOn()).toBe(true);

    fire();
    expect(isOn()).toBe(false);
  });

  it("leaves on Escape", () => {
    render(<SynthwaveMode />);
    konami();

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(isOn()).toBe(false);
  });

  it("lets an open dialog keep Escape for itself", () => {
    const dialog = document.createElement("div");
    dialog.setAttribute("aria-modal", "true");
    document.body.append(dialog);

    render(<SynthwaveMode />);
    konami();

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(isOn()).toBe(true);
    dialog.remove();
  });

  it("silences the soundtrack without dropping the visuals", async () => {
    const user = userEvent.setup();
    render(<SynthwaveMode />);
    konami();
    stopChiptune.mockClear();

    await user.click(screen.getByRole("button", { name: /mute/i }));

    expect(stopChiptune).toHaveBeenCalled();
    expect(isOn()).toBe(true);
  });

  it("exits from its own button", async () => {
    const user = userEvent.setup();
    render(<SynthwaveMode />);
    konami();

    await user.click(screen.getByRole("button", { name: /exit/i }));

    expect(isOn()).toBe(false);
  });

  it("cleans the flag off the document when unmounted", () => {
    const { unmount } = render(<SynthwaveMode />);
    konami();

    unmount();

    expect(isOn()).toBe(false);
    expect(stopChiptune).toHaveBeenCalled();
  });
});
