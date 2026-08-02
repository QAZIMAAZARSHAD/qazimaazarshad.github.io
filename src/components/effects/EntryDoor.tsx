import { useState, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DoorBackdrop } from "./DoorBackdrop";

/** How far the door comes off the jamb on approach, and when opened. */
const AJAR_DEG = -24;
const OPEN_DEG = -88;
/** How far the camera flies toward the doorway before the greeting takes over. */
const PULL_SCALE = 13;
/** Flight duration. Exported so the intro hands over exactly as it lands. */
export const PULL_MS = 780;

/** Swing, light spill, and the camera's flight through the doorway. */
function doorState(opening: boolean, ajar: boolean, reduceMotion: boolean) {
  let swing = 0;
  if (reduceMotion) swing = 0;
  else if (opening) swing = OPEN_DEG;
  else if (ajar) swing = AJAR_DEG;

  let spill = "opacity-25";
  if (opening) spill = "opacity-100";
  else if (ajar) spill = "opacity-80";

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
  /** True once opened — the door swings wide and the room floods out. */
  readonly opening: boolean;
  readonly buttonRef: RefObject<HTMLButtonElement | null>;
}

/**
 * The way in. Browsers won't play the greeting's music until the visitor has
 * interacted, so the gesture is made the point: a door that eases ajar as you
 * approach and swings open onto a lit room.
 */
export function EntryDoor({ onEnter, opening, buttonRef }: EntryDoorProps) {
  const reduceMotion = useReducedMotion();
  // Apart, so a mouseleave can't unlight a door that is still focused.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // The door eases off the jamb on approach, and approach means the pointer.
  // Focus lands here programmatically the moment the intro arrives, so treating
  // that as approach left the door hanging open before anyone had touched it.
  const { swing, spill, pull } = doorState(opening, hovered, !!reduceMotion);

  return (
    // Backdrop and bloom stay siblings of the animated column: a transformed
    // ancestor becomes the containing block for full-screen descendants.
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
            // Faded before it is fully scaled — the blow-up is the expensive
            // frame, and paying for it at full opacity is the worst of both.
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
            <span className="relative block h-56 w-40 rounded-2xl [perspective:1400px] group-focus-visible:ring-2 group-focus-visible:ring-accent-400/60 group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-ink-950 sm:h-64 sm:w-44">
              {/* The lit room on the other side, and the glow it spills around the
              frame once the door is off the jamb. */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent-300 via-cyan-200 to-accent-200"
              />
              <span
                aria-hidden
                className={cn(
                  "absolute -inset-8 rounded-[2.5rem] bg-accent-400/30 blur-3xl transition-opacity duration-500",
                  spill,
                )}
              />

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
                "font-mono text-[11px] uppercase tracking-[0.45em] transition-colors duration-300",
                opening || hovered || focused ? "text-white" : "text-ink-400",
              )}
            >
              Come in
            </span>
          </button>

          <p className="relative max-w-sm font-mono text-[11px] lowercase tracking-[0.2em] text-ink-500">
            and I&rsquo;ll say hello back
          </p>
        </motion.div>
      </motion.div>
    </>
  );
}
