import type { IconType } from "react-icons";
import { motion, useReducedMotion } from "framer-motion";
import { FaJava } from "react-icons/fa6";
import { SiReact, SiSpringboot, SiTypescript } from "react-icons/si";
import { profile } from "@/data/content";
import { asset, cn } from "@/lib/utils";

interface TechBadge {
  label: string;
  Icon: IconType;
  /** Absolute placement around the avatar ring. */
  position: string;
  /** Icon tint. */
  color: string;
  /** Individual float delay so chips bob out of sync. */
  delay: number;
}

const BADGES: TechBadge[] = [
  {
    label: "React",
    Icon: SiReact,
    position: "-left-6 top-6 sm:-left-10",
    color: "text-cyan-400",
    delay: 0,
  },
  {
    label: "TypeScript",
    Icon: SiTypescript,
    position: "-right-4 top-1/3 sm:-right-8",
    color: "text-accent-400",
    delay: -1.5,
  },
  {
    label: "Java",
    Icon: FaJava,
    position: "-left-4 bottom-10 sm:-left-8",
    color: "text-accent-300",
    delay: -3,
  },
  {
    label: "Spring Boot",
    Icon: SiSpringboot,
    position: "-right-2 bottom-6 sm:-right-6",
    color: "text-emerald-400",
    delay: -2.2,
  },
];

/**
 * Decorative hero visual: the avatar centered inside a slowly rotating
 * conic-gradient ring, with floating tech chips orbiting the frame.
 */
export function AvatarRing() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.2 }}
      className="relative mx-auto aspect-square w-64 sm:w-80 lg:w-[24rem]"
    >
      <div
        className="absolute inset-0 rounded-full bg-accent-500/20 blur-3xl"
        aria-hidden
      />

      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, #6366f1, #22d3ee, #818cf8, #4f46e5, #22d3ee, #6366f1)",
        }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 18, ease: "linear", repeat: Infinity }
        }
      />

      {/* inner mask so only a thin ring shows */}
      <div
        className="absolute inset-[6px] rounded-full bg-ink-950"
        aria-hidden
      />
      <div className="absolute inset-[10px] overflow-hidden rounded-full border border-white/10">
        <img
          src={asset(profile.avatar)}
          alt={`Portrait of ${profile.name}`}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent" />
      </div>

      {BADGES.map((badge, i) => (
        <motion.div
          key={badge.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.6 + i * 0.12,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
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
