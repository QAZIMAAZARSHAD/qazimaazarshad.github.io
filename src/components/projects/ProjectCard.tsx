import { motion } from "framer-motion";
import { ArrowUpRight, Calendar } from "lucide-react";
import type { ProjectItem } from "@/data/content";
import { asset, cn } from "@/lib/utils";
import { scaleIn } from "@/lib/motion";

interface ProjectCardProps {
  readonly project: ProjectItem;
  readonly onSelect: (project: ProjectItem) => void;
}

const MAX_VISIBLE_TECH = 3;

/** A single project tile: cover image, meta, and tech chips. Opens the detail modal. */
export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const visibleTech = project.tech.slice(0, MAX_VISIBLE_TECH);
  const remainingTech = project.tech.length - visibleTech.length;

  return (
    <motion.button
      type="button"
      variants={scaleIn}
      onClick={() => onSelect(project)}
      aria-label={`View details for ${project.title}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl text-left",
        "glass glass-hover",
        "transition-all duration-300 hover:-translate-y-1.5",
        "hover:shadow-2xl hover:shadow-accent-500/20",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={asset(project.image)}
          alt={project.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        {/* Persistent bottom fade for legibility + hover darkening */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
        <div className="absolute inset-0 bg-ink-950/0 transition-colors duration-300 group-hover:bg-ink-950/30" />

        <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-ink-950/70 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-accent-200 backdrop-blur">
          {project.category}
        </span>

        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/70 px-3 py-1 font-mono text-[11px] text-ink-300 backdrop-blur">
          <Calendar className="h-3 w-3" aria-hidden="true" />
          {project.date}
        </span>

        <span
          className={cn(
            "absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full",
            "bg-gradient-to-r from-accent-500 to-cyan-500 px-3 py-1.5 font-mono text-xs font-medium text-white",
            "translate-y-2 opacity-0 shadow-lg shadow-accent-500/30 transition-all duration-300",
            "group-hover:translate-y-0 group-hover:opacity-100",
          )}
        >
          View details
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-accent-200">
          {project.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-400">
          {project.blurb}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {visibleTech.map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-ink-300"
            >
              {tech}
            </span>
          ))}
          {remainingTech > 0 && (
            <span className="rounded-lg border border-accent-400/20 bg-accent-500/10 px-2.5 py-1 font-mono text-[11px] text-accent-200">
              +{remainingTech} more
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
