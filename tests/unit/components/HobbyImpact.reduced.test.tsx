import { describe, it, expect, vi } from "vitest";

// framer-motion caches its reduced-motion MediaQueryList across renders, so we
// mock the hook directly to deterministically exercise the reduced-motion path.
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return { ...actual, useReducedMotion: () => true };
});

import { render, screen } from "@testing-library/react";
import {
  HobbyImpact,
  type HobbyEffect,
} from "@/components/effects/HobbyImpact";

const imageEffect: HobbyEffect = {
  projectile: "🎬",
  image: "images/hobbies/bahubali.png",
  word: "Jai Mahishmati",
  color: "#f97316",
};

describe("HobbyImpact (reduced motion)", () => {
  it("renders only the impact word, without the projectile", () => {
    const { baseElement } = render(
      <HobbyImpact
        effect={imageEffect}
        origin={{ x: 0, y: 0 }}
        onDone={vi.fn()}
      />,
    );
    expect(screen.getByText("Jai Mahishmati")).toBeInTheDocument();
    expect(baseElement.querySelector('img[src*="bahubali"]')).toBeNull();
  });
});
