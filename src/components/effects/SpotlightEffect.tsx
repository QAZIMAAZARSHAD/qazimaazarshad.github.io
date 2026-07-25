import { useEffect } from "react";

/**
 * One global pointer listener that gives every `.spotlight` element a
 * cursor-following radial glow via CSS variables — no per-card JS or state.
 */
export function SpotlightEffect() {
  useEffect(() => {
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        ".spotlight",
      );
      if (!target) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
        target.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
