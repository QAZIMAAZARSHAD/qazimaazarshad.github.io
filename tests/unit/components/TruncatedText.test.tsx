import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TruncatedText } from "@/components/ui/TruncatedText";

describe("TruncatedText", () => {
  it("always exposes the full text via the native title attribute", () => {
    render(
      <TruncatedText
        text="A long organisation name that may clip"
        className="truncate"
      />,
    );
    expect(
      screen.getByText("A long organisation name that may clip"),
    ).toHaveAttribute("title", "A long organisation name that may clip");
  });

  it("shows a portaled tooltip only when the text is actually clipped", async () => {
    const user = userEvent.setup();
    // Force a clipped measurement: scrollWidth > clientWidth.
    const { container } = render(
      <TruncatedText text="Clipped copy" className="truncate" />,
    );
    const el = container.firstElementChild as HTMLElement;
    Object.defineProperty(el, "scrollWidth", {
      configurable: true,
      value: 200,
    });
    Object.defineProperty(el, "clientWidth", { configurable: true, value: 80 });
    Object.defineProperty(el, "scrollHeight", {
      configurable: true,
      value: 20,
    });
    Object.defineProperty(el, "clientHeight", {
      configurable: true,
      value: 20,
    });

    await user.hover(el);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Clipped copy",
    );

    await user.unhover(el);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
