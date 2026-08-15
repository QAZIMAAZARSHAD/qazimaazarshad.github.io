import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { viewportOnce } from "@/lib/motion";

const TYPE =
  "font-display font-extrabold uppercase leading-none tracking-tighter [word-spacing:0.14em] text-center text-[clamp(2.75rem,7.9vw,9.5rem)]";

const LIGHT =
  "radial-gradient(var(--lw, 1.9em) var(--lh, 0.6em) at var(--sx, 50%) var(--sy, 50%), #000 0%, #000 67%, transparent 100%)";

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
  readonly highlight?: string;
}

export function SignatureName({ name, highlight }: SignatureNameProps) {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const restRef = useRef<{ x: number; y: number } | null>(null);
  const hoveringRef = useRef(false);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    setTracking(
      !reduceMotion &&
        (window.matchMedia?.("(pointer: fine)").matches ?? false),
    );
  }, [reduceMotion]);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    const word = wordRef.current;
    if (!el || !word) return;

    let alive = true;
    let raf = 0;

    const measure = () => {
      if (!alive) return;
      // Read up front: writing a custom property invalidates the inherited
      // subtree, so interleaving reads and writes reflows the giant type.
      const { offsetWidth, offsetHeight, offsetLeft, offsetTop } = word;

      el.style.setProperty("--lw", `${offsetWidth * 0.75}px`);
      el.style.setProperty("--lh", `${offsetHeight * 0.67}px`);

      restRef.current = {
        x: offsetLeft + offsetWidth / 2,
        y: offsetTop + offsetHeight / 2,
      };
      if (!hoveringRef.current) {
        el.style.setProperty("--sx", `${restRef.current.x}px`);
        el.style.setProperty("--sy", `${restRef.current.y}px`);
      }
    };

    const onResize = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          measure();
        });
      }
    };

    measure();
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [name, highlight]);

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
    const onLeave = () => {
      hoveringRef.current = false;
      const rest = restRef.current;
      if (!rest) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        el.style.removeProperty("--sx");
        el.style.removeProperty("--sy");
        return;
      }
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

  const words = name.toUpperCase().split(" ");
  const litIndex = words.indexOf((highlight ?? "").toUpperCase());

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
        <motion.h2
          variants={GROUP}
          className={`${TYPE} text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.18)]`}
        >
          <span className="sr-only">{name}</span>
          <span aria-hidden>{renderWords(true)}</span>
        </motion.h2>

        <motion.span
          aria-hidden
          variants={GROUP}
          style={light}
          className={`${TYPE} absolute inset-0`}
        >
          <span
            className={`${TYPE} block bg-gradient-to-r from-accent-400 via-cyan-300 to-accent-400 bg-clip-text text-transparent drop-shadow-[0_0_45px_rgba(99,102,241,0.35)]`}
          >
            {renderWords(false)}
          </span>
        </motion.span>
      </div>

      <div
        aria-hidden
        className={`${TYPE} pointer-events-none h-[0.42em] overflow-hidden`}
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
