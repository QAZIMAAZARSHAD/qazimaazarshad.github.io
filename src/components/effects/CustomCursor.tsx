import { useEffect, useRef, useState } from "react";

/**
 * Elements that make the ring expand into its "interactive" state.
 * Text-entry fields are intentionally excluded so they keep their caret.
 */
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], select, summary, label, .cursor-pointer';

/** How much the trailing ring eases toward the pointer each frame (0–1). */
const RING_EASE = 0.18;

/** Below this pixel distance the ring is considered settled and the loop idles. */
const SETTLE_EPSILON = 0.1;

/** Enabled only for real mouse pointers, and never under reduced-motion. */
function cursorEnabled(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * A bespoke pointer: a dot tracking the mouse exactly, and a ring trailing
 * behind it that expands over interactive elements and contracts on click.
 *
 * Fine pointers only, never under reduced motion. Driven by transforms with no
 * React re-renders on move, and the loop idles when the pointer rests. The
 * native cursor is hidden only once this one is actually drawing.
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

    const fineMQ = window.matchMedia("(pointer: fine)");
    const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let shown = false;
    let active = true; // eligible for the current environment
    let raf = 0;

    const place = (el: HTMLElement, x: number, y: number) => {
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    // Ease the ring toward the pointer, then settle and stop so a parked
    // pointer doesn't burn a frame 60×/second forever.
    const tick = () => {
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      if (Math.abs(dx) + Math.abs(dy) < SETTLE_EPSILON) {
        ringX = mouseX;
        ringY = mouseY;
        place(ring, ringX, ringY);
        raf = 0;
        return;
      }
      ringX += dx * RING_EASE;
      ringY += dy * RING_EASE;
      place(ring, ringX, ringY);
      raf = requestAnimationFrame(tick);
    };
    const startTick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const reveal = () => {
      if (shown) return;
      shown = true;
      document.documentElement.classList.add("qma-cursor-active");
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };
    const hide = () => {
      shown = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
      document.documentElement.classList.remove("qma-cursor-active");
    };

    const onMove = (event: MouseEvent) => {
      if (!active) return;
      mouseX = event.clientX;
      mouseY = event.clientY;
      place(dot, mouseX, mouseY);
      reveal();
      const target = event.target;
      const hover =
        target instanceof Element && target.closest(INTERACTIVE_SELECTOR)
          ? "true"
          : "false";
      if (ring.dataset.hover !== hover) ring.dataset.hover = hover;
      startTick();
    };
    const onDown = (event: MouseEvent) => {
      if (active && event.button === 0) ring.dataset.active = "true";
    };
    // Also fires on window blur / context menu, where a matching mouseup
    // would otherwise never arrive and leave the ring stuck contracted.
    const onUp = () => {
      ring.dataset.active = "false";
    };
    const onLeave = () => hide();

    const onEnvChange = () => {
      const ok = fineMQ.matches && !reduceMQ.matches;
      if (ok === active) return;
      active = ok;
      if (!ok) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        ring.dataset.active = "false";
        hide();
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("blur", onUp);
    window.addEventListener("contextmenu", onUp);
    document.addEventListener("mouseleave", onLeave);
    fineMQ.addEventListener("change", onEnvChange);
    reduceMQ.addEventListener("change", onEnvChange);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("blur", onUp);
      window.removeEventListener("contextmenu", onUp);
      document.removeEventListener("mouseleave", onLeave);
      fineMQ.removeEventListener("change", onEnvChange);
      reduceMQ.removeEventListener("change", onEnvChange);
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
