import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { viewportOnce } from "@/lib/motion";

/** Shared type metrics — every layer must match exactly so they stay aligned. */
const TYPE =
  "font-display font-black uppercase leading-[0.82] tracking-tighter text-[clamp(2.75rem,9.5vw,11rem)]";

/**
 * The light that paints the gradient onto the outline type. Its radii are
 * measured from the highlighted word (--lw/--lh) so it lights exactly one word
 * at any breakpoint, and it stays elliptical so it can't bleed onto the next
 * line once the name wraps. Falls back to em units if measuring fails.
 */
const LIGHT =
  "radial-gradient(var(--lw, 1.9em) var(--lh, 0.6em) at var(--sx, 50%) var(--sy, 50%), #000 0%, #000 67%, transparent 100%)";

/** Fades the mirrored copy out as it falls away from the letters. */
const POOL_FADE =
  "linear-gradient(to bottom, rgba(0,0,0,0.38), transparent 52%)";

const GROUP: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
};

const LETTER: Variants = {
  hidden: { opacity: 0, y: "45%", rotate: -8 },
  show: {
    opacity: 1,
    y: "0%",
    rotate: 0,
    transition: { type: "spring", stiffness: 250, damping: 24 },
  },
};

interface SignatureNameProps {
  readonly name: string;
  /** Word the resting light sits on before the pointer takes over. */
  readonly highlight?: string;
}

/**
 * The footer's centrepiece: the name set enormous as ghost outline type, with a
 * vivid gradient copy revealed through a light that tracks the cursor — so
 * moving the mouse "paints" the letters. Letters spring in on scroll and a
 * blurred mirror image pools beneath them.
 *
 * The gradient and mirror layers are decorative duplicates (aria-hidden); the
 * heading's accessible name comes from a single visually-hidden span. On touch
 * or under reduced motion the gradient is simply always lit.
 */
export function SignatureName({ name, highlight }: SignatureNameProps) {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const restRef = useRef<{ x: number; y: number } | null>(null);
  const hoveringRef = useRef(false);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    setTracking(window.matchMedia?.("(pointer: fine)").matches ?? false);
  }, [reduceMotion]);

  // Park the resting light over the highlighted word. Measured from layout
  // offsets (not bounding rects) so the letters' entrance transforms can't
  // skew it, and re-measured when the type reflows or the webfont swaps in.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    const word = wordRef.current;
    if (!el || !word) return;

    const measure = () => {
      // Radii from the word box, chosen so the gradient's 67% stop lands on the
      // word's edge: the whole word is at full brightness, then haloes out over
      // roughly one more character. Vertically it dies inside one line box so a
      // wrapped name never bleeds onto the line below.
      el.style.setProperty("--lw", `${word.offsetWidth * 0.75}px`);
      el.style.setProperty("--lh", `${word.offsetHeight * 0.67}px`);

      restRef.current = {
        x: word.offsetLeft + word.offsetWidth / 2,
        y: word.offsetTop + word.offsetHeight / 2,
      };
      if (!hoveringRef.current) {
        el.style.setProperty("--sx", `${restRef.current.x}px`);
        el.style.setProperty("--sy", `${restRef.current.y}px`);
      }
    };

    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, [highlight]);

  // Pointer → CSS vars, rAF-throttled so tracking never re-renders React.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !tracking) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      el.style.setProperty("--sx", `${x}px`);
      el.style.setProperty("--sy", `${y}px`);
      raf = 0;
    };
    const onMove = (event: PointerEvent) => {
      hoveringRef.current = true;
      const rect = el.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    // Settle back onto the highlighted word when the pointer leaves.
    const onLeave = () => {
      hoveringRef.current = false;
      const rest = restRef.current;
      if (!rest) return;
      x = rest.x;
      y = rest.y;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [tracking]);

  // Word-level grouping keeps letters unbreakable but still lets the name wrap.
  const words = name.toUpperCase().split(" ");
  const litIndex = words.indexOf((highlight ?? "").toUpperCase());

  // Rendered per layer so only the (layout-defining) ghost layer carries the ref.
  const renderWords = (measured: boolean) =>
    words.map((word, wi) => (
      <Fragment key={`${word}-${wi}`}>
        <span
          ref={measured && wi === litIndex ? wordRef : undefined}
          data-testid={
            measured && wi === litIndex ? "signature-highlight" : undefined
          }
          className="inline-block whitespace-nowrap"
        >
          {[...word].map((char, ci) => (
            <motion.span
              key={`${char}-${ci}`}
              variants={LETTER}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
        {wi < words.length - 1 ? " " : null}
      </Fragment>
    ));

  // The light is always on (parked over the highlighted word); only following
  // the pointer is desktop-only, so touch devices get the same focused look.
  const light = { WebkitMaskImage: LIGHT, maskImage: LIGHT };

  return (
    <motion.div
      ref={wrapRef}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="relative select-none"
    >
      <div className="relative">
        {/* Outline "ghost" type — the real, accessible heading. */}
        <motion.h2
          variants={GROUP}
          className={`${TYPE} text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.18)]`}
        >
          <span className="sr-only">{name}</span>
          <span aria-hidden>{renderWords(true)}</span>
        </motion.h2>

        {/* Gradient copy, revealed by the cursor light. */}
        <motion.span
          aria-hidden
          variants={GROUP}
          style={light}
          className={`${TYPE} absolute inset-0 bg-gradient-to-r from-accent-400 via-cyan-300 to-accent-400 bg-clip-text text-transparent drop-shadow-[0_0_45px_rgba(99,102,241,0.35)]`}
        >
          {renderWords(false)}
        </motion.span>
      </div>

      {/* Mirrored pool beneath the letters — same markup, so it wraps alike. */}
      <div
        aria-hidden
        className={`${TYPE} pointer-events-none relative h-[0.42em] overflow-hidden`}
        style={{ WebkitMaskImage: POOL_FADE, maskImage: POOL_FADE }}
      >
        <motion.div
          variants={GROUP}
          className={`${TYPE} scale-y-[-1] bg-gradient-to-r from-accent-400/45 via-cyan-300/45 to-accent-400/45 bg-clip-text text-transparent blur-[2px]`}
        >
          {renderWords(false)}
        </motion.div>
      </div>
    </motion.div>
  );
}
