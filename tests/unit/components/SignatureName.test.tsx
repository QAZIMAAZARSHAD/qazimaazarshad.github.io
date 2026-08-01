import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SignatureName } from "@/components/footer/SignatureName";

/** jsdom reports 0 for layout boxes; give the word a realistic one. */
function stubLayout({ width = 340, height = 112, left = 500, top = 0 } = {}) {
  const props = {
    offsetWidth: width,
    offsetHeight: height,
    offsetLeft: left,
    offsetTop: top,
  };
  for (const [key, value] of Object.entries(props)) {
    vi.spyOn(
      HTMLElement.prototype,
      key as "offsetWidth",
      "get",
    ).mockReturnValue(value);
  }
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SignatureName", () => {
  it("exposes one clean heading name, not letter-by-letter", () => {
    render(<SignatureName name="Qazi Maaz Arshad" highlight="Maaz" />);
    const heading = screen.getByRole("heading", { name: "Qazi Maaz Arshad" });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H2");
  });

  it("renders the ghost, gradient and mirrored layers", () => {
    const { container } = render(
      <SignatureName name="Qazi Maaz Arshad" highlight="Maaz" />,
    );
    // Every layer repeats the word, so the letter "Q" appears once per layer.
    const qs = [...container.querySelectorAll("span")].filter(
      (el) => el.textContent === "Q" && el.childElementCount === 0,
    );
    expect(qs).toHaveLength(3);
  });

  it("marks the duplicated decorative layers aria-hidden", () => {
    const { container } = render(
      <SignatureName name="Qazi Maaz Arshad" highlight="Maaz" />,
    );
    // The only non-hidden copy of the name is the heading's sr-only span.
    const visibleToAT = [...container.querySelectorAll("[aria-hidden='true']")];
    expect(visibleToAT.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Qazi Maaz Arshad")).toHaveClass("sr-only");
  });

  it("parks the light on the highlighted word, sized from its box", () => {
    stubLayout({ width: 340, height: 112, left: 500, top: 0 });
    const { container } = render(
      <SignatureName name="Qazi Maaz Arshad" highlight="Maaz" />,
    );
    const wrap = container.firstElementChild as HTMLElement;

    expect(wrap.style.getPropertyValue("--sx")).toBe("670px");
    expect(wrap.style.getPropertyValue("--sy")).toBe("56px");
    expect(wrap.style.getPropertyValue("--lw")).toBe("255px");
    expect(wrap.style.getPropertyValue("--lh")).toBe(`${112 * 0.67}px`);
  });

  it("tags the highlighted word so its position is assertable", () => {
    render(<SignatureName name="Qazi Maaz Arshad" highlight="Maaz" />);
    expect(screen.getByTestId("signature-highlight")).toHaveTextContent("MAAZ");
  });

  it("still renders when the highlighted word is absent", () => {
    const { container } = render(
      <SignatureName name="Qazi Maaz Arshad" highlight="Nobody" />,
    );
    expect(
      screen.getByRole("heading", { name: "Qazi Maaz Arshad" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("signature-highlight")).not.toBeInTheDocument();
    // No measurement — the mask falls back to its em-based defaults.
    const wrap = container.firstElementChild as HTMLElement;
    expect(wrap.style.getPropertyValue("--sx")).toBe("");
  });
});
