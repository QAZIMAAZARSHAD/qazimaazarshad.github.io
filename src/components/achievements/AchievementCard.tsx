import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Award,
  Star,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/ui/CountUp";

const achievementIcons: LucideIcon[] = [Trophy, Medal, Award, Star, Crown];

// First number (with optional trailing "+"); only counts up meaningful values.
const NUMERIC = /(\d+)(\+?)/;

/** Renders the text, animating the first number >= 10 as an accent count-up. */
function AchievementText({ text }: { readonly text: string }) {
  const match = NUMERIC.exec(text);
  if (!match || Number(match[1]) < 10) return <>{text}</>;
  return (
    <>
      {text.slice(0, match.index)}
      <CountUp
        value={Number(match[1])}
        suffix={match[2]}
        className="font-semibold text-accent-200"
      />
      {text.slice(match.index + match[0].length)}
    </>
  );
}

interface AchievementCardProps {
  text: string;
  index: number;
  className?: string;
}

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
        "glass glass-hover spotlight group flex items-center gap-4 rounded-2xl p-4",
        "hover:shadow-xl hover:shadow-accent-500/20",
        className,
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500/20 to-cyan-400/10 text-accent-300 ring-1 ring-inset ring-white/10 transition-transform duration-300 group-hover:scale-105 group-hover:text-accent-200">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="text-sm leading-snug text-ink-200 sm:text-base">
        <AchievementText text={text} />
      </p>
    </motion.li>
  );
}
