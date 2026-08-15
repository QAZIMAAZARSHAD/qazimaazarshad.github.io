const ACCENT_COLORS = ["#6366f1", "#818cf8", "#22d3ee", "#06b6d4", "#a78bfa"];

export function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export async function celebrateBig(): Promise<void> {
  if (reducedMotion()) return;
  const { default: confetti } = await import("canvas-confetti");
  const common = {
    colors: ACCENT_COLORS,
    disableForReducedMotion: true,
  } as const;

  confetti({
    ...common,
    particleCount: 150,
    spread: 100,
    startVelocity: 46,
    origin: { y: 0.62 },
  });

  const until = Date.now() + 1000;
  const cannons = () => {
    confetti({
      ...common,
      particleCount: 5,
      angle: 60,
      spread: 66,
      origin: { x: 0, y: 0.72 },
    });
    confetti({
      ...common,
      particleCount: 5,
      angle: 120,
      spread: 66,
      origin: { x: 1, y: 0.72 },
    });
    if (Date.now() < until) requestAnimationFrame(cannons);
  };
  cannons();
}

export async function celebrate(): Promise<void> {
  if (reducedMotion()) return;
  const { default: confetti } = await import("canvas-confetti");
  confetti({
    particleCount: 90,
    spread: 72,
    startVelocity: 42,
    origin: { y: 0.85 },
    colors: ACCENT_COLORS,
    disableForReducedMotion: true,
  });
}
