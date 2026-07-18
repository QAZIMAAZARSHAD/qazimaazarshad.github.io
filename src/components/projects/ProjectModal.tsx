import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Calendar, ExternalLink, Tag, X } from "lucide-react";
import type { ProjectItem } from "@/data/content";
import { asset } from "@/lib/utils";

interface ProjectModalProps {
  readonly project: ProjectItem;
  readonly onClose: () => void;
}

/** Selector for elements that can receive keyboard focus inside the dialog. */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible, centered detail dialog for a single project. Rendered through a
 * portal into document.body so the modal lives outside the (inert) app root.
 * Handles Escape-to-close, backdrop click, body-scroll lock, a Tab focus trap,
 * and restoring focus to the element that opened it.
 */
export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Lock body scroll while open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Hide the app root from AT and prevent tab-out while open. The portal places
  // the modal outside #root, so it remains interactive.
  useEffect(() => {
    const root = document.getElementById("root");
    root?.setAttribute("inert", "");
    root?.setAttribute("aria-hidden", "true");
    return () => {
      root?.removeAttribute("inert");
      root?.removeAttribute("aria-hidden");
    };
  }, []);

  // Store the previously focused element, focus the close button, and restore
  // focus to the opener on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => {
      previouslyFocused?.focus();
    };
  }, []);

  // Escape-to-close + Tab focus trap.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="glass relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl shadow-2xl shadow-accent-500/10"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-ink-950/70 text-ink-300 backdrop-blur transition-all duration-300 hover:border-accent-400/40 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="overflow-y-auto">
          {/* Hero image */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={asset(project.image)}
              alt={project.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
            <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-ink-950/70 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-accent-200 backdrop-blur">
              {project.category}
            </span>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <div className="flex flex-col gap-2">
              <h3
                id={titleId}
                className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl"
              >
                {project.title}
              </h3>
              <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-ink-400">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {project.date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                  {project.category}
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-ink-300 sm:text-base">
              {project.description}
            </p>

            {/* Tech stack */}
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent-300">
                Tech stack
              </span>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs text-ink-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noreferrer"
                className="group mt-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent-500 to-cyan-500 px-6 py-3 font-mono text-sm font-medium text-white shadow-lg shadow-accent-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
              >
                Open project
                <ExternalLink
                  className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
