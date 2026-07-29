import { useEffect, useRef, useState } from "react";

/** Elements that make the ring expand into its "interactive" state. */
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, label, summary, .cursor-pointer';

/** How much the trailing ring eases toward the pointer each frame (0–1). */
const RING_EASE = 0.18;

/** Enabled only for real mouse pointers, and never under reduced-motion. */
function cursorEnabled(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * A bespoke pointer: a glowing dot that tracks the mouse instantly plus a ring
 * that trails with a springy lag, expanding over interactive elements and
 * contracting on click. Runs only on fine (mouse) pointers and never under
 * prefers-reduced-motion; GPU-accelerated via transforms with no React
 * re-renders on move.
 */
export function CustomCursor() {
  const [enabled] = useState(cursorEnabled);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("qma-cursor-active");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let shown = false;
    let raf = 0;

    const place = (el: HTMLElement, x: number, y: number) => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const onMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      place(dot, mouseX, mouseY);
      if (!shown) {
        shown = true;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
      const target = event.target as Element | null;
      ring.dataset.hover = target?.closest(INTERACTIVE_SELECTOR)
        ? "true"
        : "false";
    };
    const onDown = () => (ring.dataset.active = "true");
    const onUp = () => (ring.dataset.active = "false");
    const onLeave = () => {
      shown = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const tick = () => {
      ringX += (mouseX - ringX) * RING_EASE;
      ringY += (mouseY - ringY) * RING_EASE;
      place(ring, ringX, ringY);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("qma-cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="qma-cursor-layer">
      <div ref={ringRef} className="qma-cursor-ring" />
      <div ref={dotRef} className="qma-cursor-dot" />
    </div>
  );
}
