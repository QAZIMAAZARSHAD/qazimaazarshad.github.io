import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import {
  HobbyImpact,
  type HobbyEffect,
} from "@/components/effects/HobbyImpact";

const emojiEffect: HobbyEffect = {
  projectile: "🏸",
  word: "Smash!",
  color: "#22c55e",
  shake: true,
};

const imageEffect: HobbyEffect = {
  projectile: "🎬",
  image: "images/hobbies/bahubali.png",
  word: "Jai Mahishmati",
  color: "#f97316",
};

describe("HobbyImpact", () => {
  it("renders the impact word and an emoji projectile", () => {
    render(
      <HobbyImpact
        effect={emojiEffect}
        origin={{ x: 10, y: 10 }}
        onDone={vi.fn()}
      />,
    );
    expect(screen.getByText("Smash!")).toBeInTheDocument();
    expect(screen.getByText("🏸")).toBeInTheDocument();
  });

  it("renders an image projectile when an image is provided", () => {
    const { baseElement } = render(
      <HobbyImpact
        effect={imageEffect}
        origin={{ x: 0, y: 0 }}
        onDone={vi.fn()}
      />,
    );
    expect(screen.getByText("Jai Mahishmati")).toBeInTheDocument();
    expect(baseElement.querySelector('img[src*="bahubali"]')).not.toBeNull();
  });

  it("falls back to the emoji projectile if the image fails to load", () => {
    const { baseElement } = render(
      <HobbyImpact
        effect={imageEffect}
        origin={{ x: 0, y: 0 }}
        onDone={vi.fn()}
      />,
    );
    const img = baseElement.querySelector('img[src*="bahubali"]');
    expect(img).not.toBeNull();

    fireEvent.error(img!);

    expect(baseElement.querySelector('img[src*="bahubali"]')).toBeNull();
    expect(screen.getByText(imageEffect.projectile)).toBeInTheDocument();
  });

  it("calls onDone after its lifetime elapses", () => {
    vi.useFakeTimers();
    try {
      const onDone = vi.fn();
      render(
        <HobbyImpact
          effect={emojiEffect}
          origin={{ x: 0, y: 0 }}
          onDone={onDone}
        />,
      );
      expect(onDone).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(10_000);
      });
      expect(onDone).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("shakes #root on impact for a shake effect, then cleans up on unmount", () => {
    vi.useFakeTimers();
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
    try {
      const { unmount } = render(
        <HobbyImpact
          effect={emojiEffect}
          origin={{ x: 0, y: 0 }}
          onDone={vi.fn()}
        />,
      );
      expect(root.classList.contains("qma-shake")).toBe(false);
      act(() => {
        vi.advanceTimersByTime(1200);
      });
      expect(root.classList.contains("qma-shake")).toBe(true);
      // Unmounting mid-shake removes the class this instance added (no leak).
      unmount();
      expect(root.classList.contains("qma-shake")).toBe(false);
    } finally {
      vi.useRealTimers();
      root.remove();
    }
  });
});
