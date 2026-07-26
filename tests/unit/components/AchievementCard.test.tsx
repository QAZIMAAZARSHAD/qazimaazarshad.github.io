import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AchievementCard } from "@/components/achievements/AchievementCard";

describe("AchievementCard", () => {
  it("renders plain text with no interactive element by default", () => {
    render(<AchievementCard text="Winner — Something" index={0} />);
    expect(screen.getByText("Winner — Something")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders a button that calls onOpen when given onOpen", () => {
    const onOpen = vi.fn();
    render(
      <AchievementCard text="Gold Medal — Foo" index={0} onOpen={onOpen} />,
    );
    const button = screen.getByRole("button", {
      name: /view certificate: gold medal — foo/i,
    });
    fireEvent.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("renders an external link (new tab) when given href", () => {
    render(
      <AchievementCard
        text="Solver on HackerRank"
        index={0}
        href="https://www.hackerrank.com/x"
      />,
    );
    const link = screen.getByRole("link", {
      name: /solver on hackerrank \(opens in a new tab\)/i,
    });
    expect(link).toHaveAttribute("href", "https://www.hackerrank.com/x");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
  });

  it("renders numeric achievements without crashing", () => {
    const { container } = render(
      <AchievementCard text="All India Rank 49 — X" index={1} />,
    );
    expect(container.textContent).toContain("All India Rank");
  });
});
