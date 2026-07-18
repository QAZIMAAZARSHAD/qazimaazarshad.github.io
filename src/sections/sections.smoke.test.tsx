import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { About } from "@/sections/About";
import { Skills } from "@/sections/Skills";
import { Achievements } from "@/sections/Achievements";
import { Experience } from "@/sections/Experience";
import { Education } from "@/sections/Education";
import {
  profile,
  stats,
  skillGroups,
  achievements,
  experience,
  education,
} from "@/data/content";

describe("About", () => {
  it("renders its heading, intro, and a stat", () => {
    render(<About />);

    expect(
      screen.getByRole("heading", { name: /full-stack engineering, amplified by ai/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(profile.intro)).toBeInTheDocument();
    expect(screen.getByText(stats[0].label)).toBeInTheDocument();
  });
});

describe("Skills", () => {
  it("renders its heading and every skill group name", () => {
    render(<Skills />);

    expect(
      screen.getByRole("heading", { name: /skills & technologies/i }),
    ).toBeInTheDocument();
    for (const group of skillGroups) {
      expect(
        screen.getByRole("heading", { name: group.name }),
      ).toBeInTheDocument();
    }
  });
});

describe("Achievements", () => {
  it("renders its heading and the first achievement", () => {
    render(<Achievements />);

    expect(
      screen.getByRole("heading", { name: /awards & achievements/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /beyond the code/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(achievements[0])).toBeInTheDocument();
  });
});

describe("Experience", () => {
  it("renders its heading and the current role", () => {
    render(<Experience />);

    expect(
      screen.getByRole("heading", { name: /where i've made an impact/i }),
    ).toBeInTheDocument();

    const current = experience.find((e) => e.current)!;
    expect(
      screen.getByRole("heading", { name: current.role }),
    ).toBeInTheDocument();
    expect(screen.getByText("Current")).toBeInTheDocument();
  });
});

describe("Education", () => {
  it("renders its heading and the first degree", () => {
    render(<Education />);

    expect(
      screen.getByRole("heading", { name: /academic foundation/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: education[0].degree }),
    ).toBeInTheDocument();
  });
});
