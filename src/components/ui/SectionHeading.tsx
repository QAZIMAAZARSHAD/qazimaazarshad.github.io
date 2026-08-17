import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  /** Substring of `title` to carry the brand gradient, as the hero name does. */
  highlight?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/** Splits the title so `highlight` can be wrapped without breaking the text. */
function titleParts(title: string, highlight?: string) {
  const at = highlight ? title.lastIndexOf(highlight) : -1;
  if (at < 0 || !highlight) return { before: title, match: "", after: "" };
  return {
    before: title.slice(0, at),
    match: highlight,
    after: title.slice(at + highlight.length),
  };
}

export function SectionHeading({
  kicker,
  title,
  highlight,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  const { before, match, after } = titleParts(title, highlight);
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className={cn(
        "mb-12 flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {kicker && (
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent-300">
          <span className="h-px w-6 bg-accent-400/60" />
          {kicker}
        </span>
      )}
      <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
        {before}
        {match && <span className="text-gradient">{match}</span>}
        {after}
      </h2>
      <motion.span
        aria-hidden
        className={cn(
          "h-[3px] w-16 origin-left rounded-full bg-gradient-to-r from-accent-400 to-cyan-400",
          align === "center" && "mx-auto",
        )}
        initial={prefersReducedMotion ? false : { scaleX: 0 }}
        whileInView={prefersReducedMotion ? undefined : { scaleX: 1 }}
        viewport={viewportOnce}
        transition={{ duration: 1.1, ease: [0.21, 0.47, 0.32, 0.98] }}
      />
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-ink-400">
          {description}
        </p>
      )}
    </motion.div>
  );
}
