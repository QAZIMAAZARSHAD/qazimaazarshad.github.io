import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

const DOT_GRID = {
  backgroundImage:
    "radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px)",
  backgroundSize: "26px 26px",
  WebkitMaskImage:
    "radial-gradient(ellipse 65% 55% at 50% 50%, #000 5%, transparent 72%)",
  maskImage:
    "radial-gradient(ellipse 65% 55% at 50% 50%, #000 5%, transparent 72%)",
};

const TORCH =
  "radial-gradient(520px circle at var(--dx, 50%) var(--dy, 45%), rgba(99,102,241,0.20), rgba(34,211,238,0.06) 40%, transparent 68%)";

const VIGNETTE =
  "radial-gradient(ellipse at center, transparent 35%, rgba(2,6,23,0.75) 100%)";

export function DoorBackdrop() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Pointer → CSS vars via rAF, so tracking never re-renders React.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      el.style.setProperty("--dx", `${x}px`);
      el.style.setProperty("--dy", `${y}px`);
      raf = 0;
    };
    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={ref}
      aria-hidden
      data-testid="door-scenery"
      className="pointer-events-none absolute inset-0"
    >
      <div className="absolute inset-0" style={DOT_GRID} />

      <motion.div
        className="absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(129,140,248,0.22), transparent 65%)",
        }}
        animate={reduceMotion ? undefined : { x: [0, 60, 0], y: [0, -40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-28 bottom-1/4 h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.18), transparent 65%)",
        }}
        animate={reduceMotion ? undefined : { x: [0, -50, 0], y: [0, 45, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0" style={{ background: TORCH }} />
      <div className="absolute inset-0" style={{ background: VIGNETTE }} />
    </div>
  );
}
