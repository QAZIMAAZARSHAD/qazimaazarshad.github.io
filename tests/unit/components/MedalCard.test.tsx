import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MedalCard } from "@/components/achievements/MedalCard";
import { parseHonour } from "@/lib/honours";

describe("MedalCard", () => {
  it("renders plain text with no interactive element by default", () => {
    render(<MedalCard honour={parseHonour("Winner — Something")} />);
    expect(screen.getByText("Something")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders a button that calls onOpen when given onOpen", () => {
    const onOpen = vi.fn();
    render(
      <MedalCard honour={parseHonour("Gold Medal — Foo")} onOpen={onOpen} />,
    );
    const button = screen.getByRole("button", {
      name: /view certificate: gold medal — foo/i,
    });
    fireEvent.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("renders an external link (new tab) when given href", () => {
    render(
      <MedalCard
        honour={parseHonour("Gold Medal — Example Olympiad")}
        href="https://example.com/award"
      />,
    );
    const link = screen.getByRole("link", {
      name: /gold medal — example olympiad \(opens in a new tab\)/i,
    });
    expect(link).toHaveAttribute("href", "https://example.com/award");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
  });

  it("strikes the rank into the medal face", () => {
    const { container } = render(
      <MedalCard
        honour={parseHonour("All India Rank 49 — X")}
        variant="featured"
      />,
    );
    expect(container.textContent).toContain("X");
    expect(container.textContent).toContain("AIR");
  });

  it("captions a competition with the level it was won at", () => {
    render(
      <MedalCard honour={parseHonour("1st Prize — Quiz (District Level)")} />,
    );
    expect(screen.getByText(/district level/i)).toBeInTheDocument();
  });
});
