import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { profile } from "@/data/content";
import { cn } from "@/lib/utils";

// Short hold under Playwright — the suite enters through this on every test.
const automated =
  typeof navigator !== "undefined" && navigator.webdriver === true;

export const HOLD_MS = automated ? 600 : 4000;
const SEAL_MS = automated ? 120 : 560;
const STALL_MS = 15_000;

const R = 86;
const CIRCUMFERENCE = 2 * Math.PI * R;
const TICK_R = 71;
const TICK_CIRCUMFERENCE = 2 * Math.PI * TICK_R;

/** Caps at 92% until the page is ready so a slow load never looks finished. */
export function progressAt(elapsed: number, ready: boolean): number {
  const timed = Math.min(elapsed / HOLD_MS, 1);
  if (ready) return timed;
  if (elapsed <= HOLD_MS) return Math.min(timed, 0.92);
  return 0.92 + 0.07 * (1 - Math.exp(-(elapsed - HOLD_MS) / 4000));
}

const LETTERS = [...profile.name.toUpperCase()];

interface LoaderStageProps {
  readonly onDone: () => void;
}

export function LoaderStage({ onDone }: LoaderStageProps) {
  const reduce = useReducedMotion() ?? false;
  const [pct, setPct] = useState(0);
  const [sealed, setSealed] = useState(false);
  const arc = useMotionValue(0);
  const readyRef = useRef(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    let handoff = 0;

    const seal = () => {
      if (cancelled) return;
      readyRef.current = true;
      handoff = window.setTimeout(
        () => setSealed(true),
        Math.max(0, HOLD_MS - (Date.now() - startRef.current)),
      );
    };

    const settle = () => {
      const fonts = document.fonts?.ready;
      if (fonts) void fonts.then(seal, seal);
      else seal();
    };

    if (document.readyState === "complete") settle();
    else window.addEventListener("load", settle, { once: true });

    const stalled = window.setTimeout(() => {
      readyRef.current = true;
      setSealed(true);
    }, STALL_MS);

    return () => {
      cancelled = true;
      window.removeEventListener("load", settle);
      window.clearTimeout(handoff);
      window.clearTimeout(stalled);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = sealed
        ? 1
        : progressAt(Date.now() - startRef.current, readyRef.current);
      arc.set(p);
      setPct(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [arc, sealed]);

  useEffect(() => {
    if (!sealed) return;
    const id = window.setTimeout(onDone, SEAL_MS);
    return () => window.clearTimeout(id);
  }, [sealed, onDone]);

  const dashOffset = useTransform(arc, (p) => CIRCUMFERENCE * (1 - p));
  const tickOffset = useTransform(arc, (p) => TICK_CIRCUMFERENCE * (1 - p));
  const headRotate = useTransform(arc, (p) => p * 360);

  return (
    <motion.div
      className="absolute inset-0 grid place-items-center overflow-hidden"
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.12 }}
      transition={{ duration: 0.45, ease: "easeIn" }}
    >
      <Scenery reduce={reduce} sealed={sealed} />

      <div className="relative flex flex-col items-center">
        <div className="relative h-[min(80vw,26rem)] w-[min(80vw,26rem)]">
          {!reduce && <Pulses />}

          <svg
            viewBox="0 0 200 200"
            aria-hidden
            className="absolute inset-0 h-full w-full -rotate-90"
          >
            <defs>
              <linearGradient id="qma-loader-arc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <mask id="qma-loader-sweep">
                <motion.circle
                  cx="100"
                  cy="100"
                  r={TICK_R}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="22"
                  strokeDasharray={TICK_CIRCUMFERENCE}
                  style={{ strokeDashoffset: tickOffset }}
                />
              </mask>
            </defs>

            <circle
              cx="100"
              cy="100"
              r="97"
              fill="none"
              stroke="rgba(129,140,248,0.25)"
              strokeWidth="1"
              strokeDasharray="2 12"
              className={cn(!reduce && "qma-spin-slow")}
              style={{ transformOrigin: "100px 100px" }}
            />
            <circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="2"
            />
            <circle
              cx="100"
              cy="100"
              r={TICK_R}
              fill="none"
              stroke="rgba(255,255,255,0.11)"
              strokeWidth="7"
              strokeDasharray="1.5 7"
            />
            <circle
              cx="100"
              cy="100"
              r={TICK_R}
              fill="none"
              stroke="#a5b4fc"
              strokeWidth="7"
              strokeDasharray="1.5 7"
              mask="url(#qma-loader-sweep)"
            />
            <motion.circle
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke="url(#qma-loader-arc)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>

          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{ rotate: headRotate }}
          >
            <span className="absolute left-1/2 top-[7%] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_16px_4px_rgba(34,211,238,0.7)]" />
          </motion.div>

          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center">
              <span
                aria-hidden
                className={cn(
                  "font-mono text-[clamp(2.5rem,9vw,5rem)] font-bold leading-none tabular-nums transition-colors duration-300",
                  sealed ? "text-white" : "text-gradient",
                )}
              >
                <span data-testid="loader-count">
                  {String(pct).padStart(3, "0")}
                </span>
                <span className="align-super text-[0.32em] text-ink-500">
                  %
                </span>
              </span>
              <output className="mt-4 font-mono text-[10px] uppercase tracking-[0.42em] text-ink-500 sm:text-[11px]">
                Loading
              </output>
            </div>
          </div>
        </div>

        <p
          aria-hidden
          className="mt-10 flex font-display text-[clamp(0.7rem,3vw,1.15rem)] font-semibold uppercase tracking-[0.42em]"
        >
          {LETTERS.map((ch, i) => {
            if (ch === " ")
              return <span key={`sp${i}`} className="inline-block w-[0.7em]" />;
            const lit = pct >= ((i + 1) / LETTERS.length) * 100;
            return (
              <span
                key={`${ch}${i}`}
                className={cn(
                  "transition-colors duration-500",
                  lit
                    ? "text-white [text-shadow:0_0_18px_rgba(129,140,248,0.85)]"
                    : "text-ink-700",
                )}
              >
                {ch}
              </span>
            );
          })}
        </p>
      </div>
    </motion.div>
  );
}

function Scenery({
  reduce,
  sealed,
}: Readonly<{ reduce: boolean; sealed: boolean }>) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <motion.span
        className="absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-600/30 blur-[150px]"
        animate={
          reduce ? undefined : { scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }
        }
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/25 blur-[120px]"
        animate={
          reduce
            ? undefined
            : { x: [0, 120, 0, -120, 0], y: [0, -90, 0, 90, 0] }
        }
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <span
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 46%, transparent 24%, rgba(2,6,23,0.8) 72%)",
        }}
      />

      {sealed && !reduce && (
        <motion.span
          className="absolute left-1/2 top-1/2 h-[21rem] w-[21rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-300/70"
          initial={{ scale: 0.9, opacity: 0.9 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      )}
    </div>
  );
}

function Pulses() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border border-accent-400/25"
          initial={{ scale: 0.72, opacity: 0 }}
          animate={{ scale: [0.72, 1.35], opacity: [0, 0.5, 0] }}
          transition={{
            duration: 3.2,
            repeat: Infinity,
            delay: i * 1.05,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}
