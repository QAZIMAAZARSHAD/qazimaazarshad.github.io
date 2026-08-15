import { motion } from "framer-motion";

/** Nested frames receding to the vanishing point, nearest first. */
const DEPTH = [0.78, 0.56, 0.38, 0.24];

interface DoorRoomProps {
  /** True once the door is opening and the camera starts through it. */
  readonly opening: boolean;
  readonly reduceMotion: boolean;
  /** Seconds the flight lasts, so the room resolves in step with it. */
  readonly flightSeconds: number;
}

/**
 * What is on the other side. A flat panel of light gave the camera nothing to
 * fly through, so the doorway holds a corridor: frames receding to a vanishing
 * point, light spilling from it, and the monogram waiting at the end.
 *
 * The corridor travels as one layer rather than per-frame. All of this sits
 * inside a subtree the door scales to 13x, where every independently animated
 * element is re-rasterised at that size — six of them cost a fifth of the
 * flight's frames. Moving forward scales everything about the vanishing point
 * together anyway, so one transform is both cheaper and truer.
 */
export function DoorRoom({
  opening,
  reduceMotion,
  flightSeconds,
}: DoorRoomProps) {
  const travelling = opening && !reduceMotion;

  return (
    <span
      aria-hidden
      className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-b from-white via-cyan-100 to-accent-200"
    >
      <span className="absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_46%,#fff_0%,rgba(255,255,255,0.65)_35%,transparent_72%)]" />

      <motion.span
        initial={false}
        animate={
          travelling ? { scale: 5.5, opacity: 0 } : { scale: 1, opacity: 1 }
        }
        transition={{ duration: flightSeconds, ease: [0.55, 0, 0.9, 0.35] }}
        data-testid="door-corridor"
        className="absolute inset-0"
      >
        {DEPTH.map((depth) => (
          <span
            key={depth}
            style={{ transform: `scale(${depth})` }}
            className="absolute inset-[12%] rounded-xl border-2 border-accent-900/30"
          />
        ))}

        <span className="absolute inset-0 grid scale-[0.32] place-items-center font-display text-[2.75rem] font-extrabold tracking-tight text-accent-900">
          QMA
        </span>
      </motion.span>

      <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-accent-300/70 to-transparent" />
    </span>
  );
}
