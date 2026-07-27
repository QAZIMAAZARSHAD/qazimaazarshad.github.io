import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { asset, cn } from "@/lib/utils";

/**
 * Timing constants (ms). SHAKE_MS must stay in sync with the `qma-shake`
 * animation duration in index.css. LIFETIME must outlast the longest
 * transition (the impact word: WORD_DELAY + WORD_DURATION).
 */
const SHAKE_DELAY = 1150;
const SHAKE_MS = 520;
const WORD_DELAY = 1.1;
const WORD_DURATION = 2.6;
const LIFETIME = Math.round((WORD_DELAY + WORD_DURATION) * 1000) + 300; // 4000
const LIFETIME_REDUCED = 2300;

/** A themed, cinematic reaction fired when a hobby chip is clicked. */
export interface HobbyEffect {
  /** Emoji projectile — the fallback when no `image` is set or it fails to load. */
  projectile: string;
  /** Optional custom image (asset path) that rushes in instead of the emoji. */
  image?: string;
  /** Comic-style impact word shown at screen center. */
  word: string;
  /** Accent color for the flash, speed lines, and word glow. */
  color: string;
  /** Whether the whole page briefly shakes on impact. */
  shake?: boolean;
}

interface HobbyImpactProps {
  readonly effect: HobbyEffect;
  readonly origin: { x: number; y: number };
  readonly onDone: () => void;
}

const easeOut: [number, number, number, number] = [0.16, 0.84, 0.44, 1];

/**
 * Full-screen, hobby-specific animation: the themed emoji accelerates from the
 * clicked chip straight at the camera, a manga speed-line burst and color flash
 * detonate on impact, a big comic word pops in, and (optionally) the page
 * shakes. Portals over the app so nothing clips; auto-dismisses via onDone.
 */
export function HobbyImpact({ effect, origin, onDone }: HobbyImpactProps) {
  const reduceMotion = useReducedMotion();
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  // Cap how big the projectile grows so it fills the screen dramatically on
  // desktop but never overflows small screens. Base sizes: ~112px image, ~60px
  // emoji; target peak ≈ 1.2× the smaller viewport edge, clamped to [3.5, 9].
  const projectileBase = effect.image ? 112 : 60;
  const targetPeak = Math.min(window.innerWidth, window.innerHeight) * 1.2;
  const peakScale = Math.max(3.5, Math.min(9, targetPeak / projectileBase));
  const midScale = peakScale * 0.66;

  // Fall back to the emoji projectile if the custom image fails to load.
  const [imageFailed, setImageFailed] = useState(false);

  // Keep onDone stable so re-renders of the parent can't restart the timeline.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Longer catchphrases — or ones with a long single word that can't wrap
  // small (e.g. "Mahishmati") — scale down so they stay on screen.
  const longestWord = Math.max(
    ...effect.word.split(/\s+/).map((w) => w.length),
  );
  const isLongWord = effect.word.length > 16 || longestWord > 8;
  const wordSizeClass = isLongWord
    ? "text-4xl sm:text-6xl"
    : "text-6xl sm:text-8xl";

  const shake = effect.shake;

  useEffect(() => {
    const done = setTimeout(
      () => onDoneRef.current(),
      reduceMotion ? LIFETIME_REDUCED : LIFETIME,
    );

    if (!shake || reduceMotion) return () => clearTimeout(done);

    // Shake lands with the projectile's impact, not on mount. Only this
    // instance may clear the class it added (siblings can briefly coexist).
    const root = document.getElementById("root");
    let added = false;
    const start = setTimeout(() => {
      root?.classList.add("qma-shake");
      added = true;
    }, SHAKE_DELAY);
    const stop = setTimeout(() => {
      root?.classList.remove("qma-shake");
      added = false;
    }, SHAKE_DELAY + SHAKE_MS);
    return () => {
      clearTimeout(done);
      clearTimeout(start);
      clearTimeout(stop);
      if (added) root?.classList.remove("qma-shake");
    };
  }, [shake, reduceMotion]);

  if (reduceMotion) {
    return createPortal(
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[120] flex items-center justify-center px-4"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
          transition={{ duration: 1.9, times: [0, 0.12, 0.84, 1] }}
          className={cn(
            "max-w-[min(90vw,40rem)] text-balance break-words text-center font-display font-black uppercase leading-[1.08]",
            wordSizeClass,
          )}
          style={{ color: effect.color }}
        >
          {effect.word}
        </motion.span>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[120] overflow-hidden"
    >
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{
          x: "-50%",
          y: "-50%",
          width: "180vmax",
          height: "180vmax",
          background: `repeating-conic-gradient(from 0deg, ${effect.color}2b 0deg 2deg, transparent 2deg 7deg)`,
          maskImage: "radial-gradient(circle, transparent 34%, #000 62%)",
          WebkitMaskImage: "radial-gradient(circle, transparent 34%, #000 62%)",
        }}
        initial={{ opacity: 0, scale: 0.35, rotate: 0 }}
        animate={{ opacity: [0, 0.7, 0], scale: [0.35, 1], rotate: 12 }}
        transition={{ duration: 1.15, delay: 1, ease: easeOut }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          x: "-50%",
          y: "-50%",
          width: 240,
          height: 240,
          background: `radial-gradient(circle, ${effect.color}66 0%, transparent 70%)`,
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0.9, 0], scale: [0, 3.4] }}
        transition={{ duration: 0.85, delay: 1, ease: "easeOut" }}
      />

      <span
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: origin.x, top: origin.y }}
      >
        <motion.span
          className="block will-change-transform"
          initial={{ x: 0, y: 0, scale: 0.3, opacity: 0 }}
          animate={{
            x: cx - origin.x,
            y: cy - origin.y,
            scale: [0.3, 1, midScale, peakScale],
            rotate: [0, 20, 45, 65],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 1.4,
            ease: "easeIn",
            times: [0, 0.25, 0.85, 1],
          }}
        >
          {effect.image && !imageFailed ? (
            <img
              src={asset(effect.image)}
              alt=""
              loading="eager"
              decoding="async"
              onError={() => setImageFailed(true)}
              className="h-28 w-28 rounded-2xl object-contain drop-shadow-2xl sm:h-32 sm:w-32"
            />
          ) : (
            <span className="block text-6xl">{effect.projectile}</span>
          )}
        </motion.span>
      </span>

      <div className="absolute left-1/2 top-1/2 w-full max-w-[min(90vw,40rem)] -translate-x-1/2 -translate-y-1/2 px-4 text-center">
        <motion.span
          className={cn(
            "inline-block text-balance break-words font-display font-black uppercase leading-[1.08] tracking-tight",
            wordSizeClass,
          )}
          initial={{ opacity: 0, scale: 0.2, rotate: -14 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.2, 1.3, 1, 1.08],
            rotate: [-14, 7, -3, 0],
          }}
          transition={{
            duration: WORD_DURATION,
            delay: WORD_DELAY,
            ease: easeOut,
            times: [0, 0.12, 0.82, 1],
          }}
          style={{
            color: effect.color,
            textShadow: `0 6px 34px ${effect.color}99, 0 2px 0 rgba(0,0,0,0.45)`,
          }}
        >
          {effect.word}
        </motion.span>
      </div>
    </div>,
    document.body,
  );
}
