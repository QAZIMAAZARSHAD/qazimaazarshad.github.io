import { motion } from "framer-motion";
import { Trophy, Medal, Award, Star, Crown, type LucideIcon } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Icons cycled by index so the list reads with visual variety. */
const achievementIcons: LucideIcon[] = [Trophy, Medal, Award, Star, Crown];

interface AchievementCardProps {
  text: string;
  index: number;
  className?: string;
}

/**
 * A single achievement row: an award-style gradient icon tile beside the
 * achievement text. Inherits its reveal from the parent stagger container.
 */
export function AchievementCard({
  text,
  index,
  className,
}: Readonly<AchievementCardProps>) {
  const Icon = achievementIcons[index % achievementIcons.length] ?? Trophy;

  return (
    <motion.li
      variants={fadeUp}
      className={cn(
        "glass glass-hover group flex items-center gap-4 rounded-2xl p-4",
        "hover:shadow-xl hover:shadow-accent-500/20",
        className,
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500/20 to-cyan-400/10 text-accent-300 ring-1 ring-inset ring-white/10 transition-transform duration-300 group-hover:scale-105 group-hover:text-accent-200">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="text-sm leading-snug text-ink-200 sm:text-base">{text}</p>
    </motion.li>
  );
}
