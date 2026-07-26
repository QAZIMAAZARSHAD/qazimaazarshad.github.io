import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Achievements } from "@/sections/Achievements";
import { achievementLinks } from "@/data/content";

describe("Achievements", () => {
  it("renders its heading", () => {
    render(<Achievements />);
    expect(
      screen.getByRole("heading", { name: /awards & achievements/i }),
    ).toBeInTheDocument();
  });

  it("links coding-profile achievements to external profiles in a new tab", () => {
    render(<Achievements />);

    const hackerrankKey = Object.keys(achievementLinks).find((k) =>
      k.includes("HackerRank"),
    )!;
    const leetcodeKey = Object.keys(achievementLinks).find((k) =>
      k.includes("LeetCode"),
    )!;

    const hackerrank = screen.getByRole("link", { name: /hackerrank/i });
    const leetcode = screen.getByRole("link", { name: /leetcode/i });

    expect(hackerrank).toHaveAttribute(
      "href",
      achievementLinks[hackerrankKey].href,
    );
    expect(hackerrank).toHaveAttribute("target", "_blank");
    expect(leetcode).toHaveAttribute(
      "href",
      achievementLinks[leetcodeKey].href,
    );
  });

  it("opens a certificate lightbox when a linked achievement is clicked", () => {
    render(<Achievements />);
    fireEvent.click(
      screen.getByRole("button", { name: /national engineering olympiad/i }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows a two-image gallery for the Gold Medal (photo + certificate)", () => {
    render(<Achievements />);
    fireEvent.click(
      screen.getByRole("button", { name: /international humanity olympiad/i }),
    );
    expect(screen.getAllByRole("button", { name: /view image/i })).toHaveLength(
      2,
    );
  });
});
