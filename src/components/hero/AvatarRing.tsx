import { useEffect } from "react";
import type { IconType } from "react-icons";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { FaJava } from "react-icons/fa6";
import { SiReact, SiSpringboot, SiTypescript } from "react-icons/si";
import { profile } from "@/data/content";
import { EASE_GLIDE } from "@/lib/motion";
import { useHasEntered } from "@/components/effects/IntroProvider";
import { asset, cn } from "@/lib/utils";

interface TechBadge {
  label: string;
  Icon: IconType;
  position: string;
  color: string;
  delay: number;
  from: { x: number; y: number };
}

const BADGES: TechBadge[] = [
  {
    label: "React",
    Icon: SiReact,
    position: "-left-6 top-6 sm:-left-10",
    color: "text-cyan-400",
    delay: 0,
    from: { x: 34, y: 26 },
  },
  {
    label: "TypeScript",
    Icon: SiTypescript,
    position: "-right-4 top-1/3 sm:-right-8",
    color: "text-accent-400",
    delay: -1.5,
    from: { x: -36, y: 16 },
  },
  {
    label: "Java",
    Icon: FaJava,
    position: "-left-4 bottom-10 sm:-left-8",
    color: "text-accent-300",
    delay: -3,
    from: { x: 32, y: -22 },
  },
  {
    label: "Spring Boot",
    Icon: SiSpringboot,
    position: "-right-2 bottom-6 sm:-right-6",
    color: "text-emerald-400",
    delay: -2.2,
    from: { x: -30, y: -24 },
  },
];

const AT = {
  bloom: 0.05,
  ring: 0.1,
  trace: 0.25,
  iris: 0.35,
  portrait: 0.4,
  scan: 0.7,
  shockwave: 0.95,
  badges: 1.0,
  badgeStep: 0.08,
} as const;

export function AvatarRing() {
  const reduce = useReducedMotion() ?? false;
  const entered = useHasEntered();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 50, damping: 18, mass: 0.5 });
  const y = useSpring(pointerY, { stiffness: 50, damping: 18, mass: 0.5 });

  useEffect(() => {
    if (reduce) return;
    const MAX = 8;
    const onMove = (e: PointerEvent) => {
      pointerX.set((e.clientX / window.innerWidth - 0.5) * 2 * MAX);
      pointerY.set((e.clientY / window.innerHeight - 0.5) * 2 * MAX);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, pointerX, pointerY]);

  const settle = { duration: 0.3 };

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
      animate={
        entered
          ? reduce
            ? { opacity: 1 }
            : { opacity: 1, scale: 1 }
          : undefined
      }
      transition={reduce ? settle : { duration: 0.9, ease: EASE_GLIDE }}
      style={reduce ? undefined : { x, y }}
      className="relative mx-auto aspect-square w-64 sm:w-80 lg:w-[24rem]"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full bg-accent-500/20 blur-3xl"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
        animate={
          entered
            ? reduce
              ? { opacity: 1 }
              : { opacity: 1, scale: 1 }
            : undefined
        }
        transition={
          reduce ? settle : { duration: 1.2, delay: AT.bloom, ease: EASE_GLIDE }
        }
      />

      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={
          reduce ? { opacity: 0 } : { opacity: 0, scale: 0.55, rotate: -170 }
        }
        animate={
          entered
            ? reduce
              ? { opacity: 1 }
              : { opacity: 1, scale: 1, rotate: 0 }
            : undefined
        }
        transition={
          reduce
            ? settle
            : {
                type: "spring",
                stiffness: 110,
                damping: 15,
                delay: AT.ring,
              }
        }
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, #6366f1, #22d3ee, #818cf8, #4f46e5, #22d3ee, #6366f1)",
          }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={
            reduce
              ? undefined
              : { duration: 18, ease: "linear", repeat: Infinity }
          }
        />
      </motion.div>

      {!reduce && (
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
        >
          <defs>
            <linearGradient id="qma-avatar-trace" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
              <stop offset="55%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          <motion.circle
            cx="50"
            cy="50"
            r="49.2"
            fill="none"
            stroke="url(#qma-avatar-trace)"
            strokeWidth="1.1"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              entered ? { pathLength: 1, opacity: [0, 1, 1, 0] } : undefined
            }
            transition={{
              duration: 1.35,
              delay: AT.trace,
              ease: EASE_GLIDE,
              opacity: {
                duration: 1.35,
                delay: AT.trace,
                times: [0, 0.1, 0.7, 1],
              },
            }}
          />
        </svg>
      )}

      <div
        className="absolute inset-[6px] rounded-full bg-ink-950"
        aria-hidden
      />

      <motion.div
        className="absolute inset-[10px] overflow-hidden rounded-full border border-white/10"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.15 }}
        animate={
          entered
            ? reduce
              ? { opacity: 1 }
              : { opacity: 1, scale: 1 }
            : undefined
        }
        transition={
          reduce
            ? settle
            : { type: "spring", stiffness: 130, damping: 18, delay: AT.iris }
        }
      >
        <motion.img
          src={asset(profile.avatar)}
          alt={`Portrait of ${profile.name}`}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
          initial={reduce ? false : { scale: 1.35, filter: "blur(18px)" }}
          animate={
            entered && !reduce ? { scale: 1, filter: "blur(0px)" } : undefined
          }
          transition={{ duration: 1.2, delay: AT.portrait, ease: EASE_GLIDE }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent" />

        {!reduce && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-cyan-200/25 to-transparent"
            initial={{ y: "-150%", opacity: 0 }}
            animate={
              entered ? { y: ["-150%", "280%"], opacity: [0, 1, 0] } : undefined
            }
            transition={{ duration: 1.1, delay: AT.scan, ease: "easeInOut" }}
          />
        )}
      </motion.div>

      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full border border-cyan-300/60"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={entered ? { scale: 1.35, opacity: [0.6, 0] } : undefined}
          transition={{ duration: 1.1, delay: AT.shockwave, ease: "easeOut" }}
        />
      )}

      {BADGES.map((badge, i) => (
        <motion.div
          key={badge.label}
          initial={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.5, x: badge.from.x, y: badge.from.y }
          }
          animate={
            entered
              ? reduce
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, x: 0, y: 0 }
              : undefined
          }
          transition={
            reduce
              ? settle
              : {
                  type: "spring",
                  stiffness: 220,
                  damping: 17,
                  delay: AT.badges + i * AT.badgeStep,
                }
          }
          className={cn("absolute z-10", badge.position)}
        >
          <div
            className="glass flex items-center gap-2 rounded-2xl px-3 py-2 shadow-lg shadow-ink-950/40 animate-float"
            style={{ animationDelay: `${badge.delay}s` }}
          >
            <badge.Icon className={cn("h-4 w-4", badge.color)} aria-hidden />
            <span className="font-mono text-xs text-ink-200">
              {badge.label}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
