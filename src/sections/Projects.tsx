import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyFilterState, FilterToolbar } from "@/components/ui/FilterToolbar";
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

      <FilterToolbar
        legend="Filter projects by category"
        chips={projectCategories.map((category) => ({
          id: category,
          label: category,
        }))}
        activeId={activeCategory}
        onCategoryChange={(id) => setActiveCategory(id as Filter)}
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search by title, blurb, or tech…"
        searchAriaLabel="Search projects"
        resultCount={filtered.length}
        resultNoun={{ singular: "project", plural: "projects" }}
        countTestId="projects-count"
      />

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
                className="glass glass-hover group inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-3 font-mono text-xs font-medium uppercase tracking-wider text-ink-200 outline-none transition-all hover:text-white focus-visible:ring-2 focus-visible:ring-accent-400/60 sm:px-6"
              >
                {expanded ? (
                  "Show less"
                ) : (
                  <>
                    {/* The full phrase is wider than a small phone and broke
                        mid-word. "projects" goes visually only, so the button
                        still reads in full. */}
                    <span>
                      Show all {filtered.length}{" "}
                      <span className="sr-only min-[400px]:not-sr-only min-[400px]:whitespace-nowrap">
                        projects
                      </span>
                    </span>
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
        <EmptyFilterState
          title="No projects found"
          description="Nothing matches your current filters. Try a different category or search term."
          onClear={clearFilters}
        />
      )}

      <AnimatePresence>
        {selected && (
          <ProjectModal project={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </Section>
  );
}
