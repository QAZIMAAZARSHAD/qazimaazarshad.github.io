import { motion } from "framer-motion";
import { fadeUp, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/** Standard section header: small kicker, gradient title, optional blurb. */
export function SectionHeading({
  kicker,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
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
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-ink-400">
          {description}
        </p>
      )}
    </motion.div>
  );
}
