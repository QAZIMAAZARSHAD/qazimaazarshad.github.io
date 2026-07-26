import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, SearchX, X } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CountUp } from "@/components/ui/CountUp";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectModal } from "@/components/projects/ProjectModal";
import {
  projectCategories,
  projects,
  type ProjectCategory,
  type ProjectItem,
} from "@/data/content";
import { staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Filter = ProjectCategory | "All";

/** How many project cards to show before the visitor expands the rest. */
const INITIAL_COUNT = 6;

export function Projects() {
  const [activeCategory, setActiveCategory] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<ProjectItem | null>(null);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesCategory =
        activeCategory === "All" || project.category === activeCategory;
      if (!matchesCategory) return false;

      if (!normalizedQuery) return true;

      const haystack = [project.title, project.blurb, ...project.tech]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [activeCategory, query]);

  // Re-mount the grid whenever the filter set changes so cards always
  // re-run their entrance animation and never get stuck in the hidden state.
  const gridKey = `${activeCategory}::${query.trim().toLowerCase()}`;
  const shown = expanded ? filtered : filtered.slice(0, INITIAL_COUNT);
  const remaining = filtered.length - shown.length;

  // Collapse back to the first page whenever the filter/search changes.
  useEffect(() => {
    setExpanded(false);
  }, [activeCategory, query]);

  const clearFilters = () => {
    setActiveCategory("All");
    setQuery("");
  };

  // Listen for skill chips in the Skills section requesting a project filter.
  // Decoupled via a window CustomEvent so the two sections stay independent.
  useEffect(() => {
    const handleFilter = (event: Event) => {
      const skill = (event as CustomEvent<string>).detail;
      if (typeof skill !== "string" || !skill) return;

      setActiveCategory("All");
      setQuery(skill);

      const projectsSection = document.getElementById("projects");
      projectsSection?.scrollIntoView?.({
        behavior: "smooth",
        block: "start",
      });
    };

    window.addEventListener("qma:filter-projects", handleFilter);
    return () =>
      window.removeEventListener("qma:filter-projects", handleFilter);
  }, []);

  return (
    <Section id="projects">
      <SectionHeading
        kicker="Projects"
        title="Things I've built"
        description="A selection of things I've built — from recent side projects to my college and learning years. Filter by category or search to explore."
      />

      <div className="mb-10 flex flex-col gap-5">
        <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0">
          <legend className="sr-only">Filter projects by category</legend>
          {projectCategories.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "inline-flex min-h-[44px] items-center rounded-full px-4 py-2.5 font-mono text-xs font-medium transition-all duration-300",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
                  isActive
                    ? "bg-gradient-to-r from-accent-500 to-cyan-500 text-white shadow-lg shadow-accent-500/25"
                    : "glass glass-hover text-ink-300 hover:text-white",
                )}
              >
                {category}
              </button>
            );
          })}
        </fieldset>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="glass glass-hover relative flex items-center rounded-2xl sm:max-w-sm sm:flex-1">
            <Search
              className="pointer-events-none absolute left-4 h-4 w-4 text-ink-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, blurb, or tech…"
              aria-label="Search projects"
              className="w-full rounded-2xl bg-transparent py-3 pl-11 pr-12 text-sm text-ink-200 placeholder:text-ink-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-400 transition-colors duration-300 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <p className="font-mono text-xs text-ink-400">
            <span data-testid="projects-count" aria-hidden="true">
              <CountUp
                value={filtered.length}
                durationMs={500}
                className="text-accent-300"
              />{" "}
              {filtered.length === 1 ? "project" : "projects"}
            </span>
            <output className="sr-only">
              {filtered.length} {filtered.length === 1 ? "project" : "projects"}
            </output>
          </p>
        </div>
      </div>

      {filtered.length > 0 ? (
        <>
          <motion.div
            key={gridKey}
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {shown.map((project) => (
              <ProjectCard
                key={project.title}
                project={project}
                onSelect={setSelected}
              />
            ))}
          </motion.div>

          {filtered.length > INITIAL_COUNT && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                className="glass glass-hover group inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-ink-200 outline-none transition-all hover:text-white focus-visible:ring-2 focus-visible:ring-accent-400/60"
              >
                {expanded ? (
                  "Show less"
                ) : (
                  <>
                    Show all {filtered.length} projects{" "}
                    <span className="text-accent-300">({remaining} more)</span>
                  </>
                )}
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "h-4 w-4 text-accent-300 transition-transform duration-300",
                    expanded && "rotate-180",
                  )}
                />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="glass flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <SearchX className="h-6 w-6 text-accent-300" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-display text-lg font-semibold text-white">
              No projects found
            </p>
            <p className="max-w-md text-sm text-ink-400">
              Nothing matches your current filters. Try a different category or
              search term.
            </p>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent-500 to-cyan-500 px-5 py-2.5 font-mono text-sm font-medium text-white shadow-lg shadow-accent-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-accent-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
          >
            Clear filters
          </button>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <ProjectModal project={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </Section>
  );
}
