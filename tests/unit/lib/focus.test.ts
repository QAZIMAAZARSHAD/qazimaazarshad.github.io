import { describe, expect, it, vi } from "vitest";
import { trapFocus } from "@/lib/focus";

function makeDialog(count: number) {
  const dialog = document.createElement("div");
  for (let i = 0; i < count; i++) {
    const btn = document.createElement("button");
    btn.textContent = `b${i}`;
    dialog.appendChild(btn);
  }
  document.body.appendChild(dialog);
  return dialog;
}

describe("trapFocus", () => {
  it("cycles Tab from the last control back to the first", () => {
    const dialog = makeDialog(3);
    const [first, , last] = dialog.querySelectorAll("button");
    last.focus();

    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    const prevent = vi.spyOn(event, "preventDefault");
    trapFocus(event, dialog);

    expect(prevent).toHaveBeenCalled();
    expect(document.activeElement).toBe(first);
    dialog.remove();
  });

  it("cycles Shift+Tab from the first control back to the last", () => {
    const dialog = makeDialog(2);
    const [first, last] = dialog.querySelectorAll("button");
    first.focus();

    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    trapFocus(event, dialog);

    expect(document.activeElement).toBe(last);
    dialog.remove();
  });

  it("ignores keys other than Tab", () => {
    const dialog = makeDialog(1);
    const event = new KeyboardEvent("keydown", { key: "Escape" });
    const prevent = vi.spyOn(event, "preventDefault");
    trapFocus(event, dialog);
    expect(prevent).not.toHaveBeenCalled();
    dialog.remove();
  });
});
