import { useEffect, useState, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DoorBackdrop } from "./DoorBackdrop";
import { DoorRoom } from "./DoorRoom";

const AJAR_DEG = -24;
const OPEN_DEG = -88;
const PULL_SCALE = 13;
export const PULL_MS = 780;

function doorState(opening: boolean, ajar: boolean, reduceMotion: boolean) {
  let swing = 0;
  if (reduceMotion) swing = 0;
  else if (opening) swing = OPEN_DEG;
  else if (ajar) swing = AJAR_DEG;

  const spill = ajar ? "opacity-80" : "opacity-25";

  const pull = reduceMotion
    ? { opacity: opening ? 0 : 1 }
    : {
        scale: opening ? [1, 1.12, PULL_SCALE] : 1,
        opacity: opening ? [1, 1, 0] : 1,
      };

  return { swing, spill, pull };
}

interface EntryDoorProps {
  readonly onEnter: () => void;
  readonly opening: boolean;
  readonly buttonRef: RefObject<HTMLButtonElement | null>;
}

export function EntryDoor({ onEnter, opening, buttonRef }: EntryDoorProps) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // :focus-visible would normally keep the ring to keyboard users, but focus is
  // put on the door before anyone has done anything, and the browser counts
  // that as keyboard-driven. So the ring waits for a real key.
  const [keyboardUsed, setKeyboardUsed] = useState(false);
  useEffect(() => {
    const onKey = () => setKeyboardUsed(true);
    window.addEventListener("keydown", onKey, { once: true });
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { swing, spill, pull } = doorState(opening, hovered, !!reduceMotion);

  return (
    <>
      <DoorBackdrop />

      {opening && !reduceMotion && (
        <motion.span
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.35, 0] }}
          transition={{ duration: PULL_MS / 1000, ease: "easeIn" }}
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-200 to-cyan-100"
        />
      )}

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative flex flex-col items-center px-6 text-center"
      >
        <motion.div
          animate={pull}
          transition={{
            scale: {
              duration: PULL_MS / 1000,
              ease: [0.55, 0, 0.9, 0.35],
              times: reduceMotion ? undefined : [0, 0.25, 1],
            },
            opacity: {
              duration: PULL_MS / 1000,
              ease: "easeIn",
              times: reduceMotion ? undefined : [0, 0.45, 0.85],
            },
          }}
          className="flex flex-col items-center gap-10"
        >
          <h1 className="relative font-display text-[clamp(2.25rem,6vw,4rem)] font-extrabold leading-none tracking-tight text-white">
            Knock knock.
          </h1>

          <button
            ref={buttonRef}
            type="button"
            // aria-disabled, not disabled: a disabled button drops focus onto
            // <body>, ejecting a keyboard visitor from the intro.
            onClick={() => !opening && onEnter()}
            aria-disabled={opening}
            // Must contain the visible label for voice control (WCAG 2.5.3).
            aria-label="Come in — enter the site"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="group relative flex flex-col items-center gap-6 focus-visible:outline-none"
          >
            <span
              className={cn(
                "relative block h-56 w-40 rounded-2xl [perspective:1400px] sm:h-64 sm:w-44",
                keyboardUsed &&
                  "group-focus-visible:ring-2 group-focus-visible:ring-accent-400/60 group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-ink-950",
              )}
            >
              <DoorRoom
                opening={opening}
                reduceMotion={!!reduceMotion}
                flightSeconds={PULL_MS / 1000}
              />
              {!opening && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute -inset-8 rounded-[2.5rem] bg-accent-400/30 blur-3xl transition-opacity duration-500",
                    spill,
                  )}
                />
              )}

              <motion.span
                aria-hidden
                animate={{ rotateY: swing }}
                transition={{
                  duration: opening ? 0.7 : 0.5,
                  ease: [0.16, 0.84, 0.44, 1],
                }}
                className="absolute inset-0 origin-left rounded-2xl border border-white/10 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 shadow-2xl shadow-black/70 [backface-visibility:hidden]"
              >
                <span className="absolute inset-x-5 inset-y-6 rounded-lg border border-white/[0.06]" />
                <span className="absolute right-3.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-gradient-to-br from-accent-200 to-cyan-200 shadow-[0_0_12px_2px_rgba(165,180,252,0.6)]" />
              </motion.span>
            </span>

            <span
              className={cn(
                "font-mono text-xs uppercase tracking-[0.45em] transition-colors duration-300",
                opening || hovered || focused ? "text-white" : "text-ink-400",
              )}
            >
              Come in
            </span>
          </button>

          <p className="relative max-w-sm font-mono text-xs lowercase tracking-[0.2em] text-ink-400">
            and I&rsquo;ll say hello back
          </p>
        </motion.div>
      </motion.div>
    </>
  );
}
