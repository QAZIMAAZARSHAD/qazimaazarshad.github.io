const ACCENT_COLORS = ["#6366f1", "#818cf8", "#22d3ee", "#06b6d4", "#a78bfa"];

function reducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/** A quick confetti burst in the site's accent palette. No-op if reduced motion. */
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
