import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SearchX, X } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CertificateCard } from "@/components/certificates/CertificateCard";
import { CertificateLightbox } from "@/components/certificates/CertificateLightbox";
import { CountUp } from "@/components/ui/CountUp";
import {
  certificateCategories,
  type CertificateCategory,
  type CertificateItem,
} from "@/data/content";
import { certificates } from "@/data/certificates";
import { staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Filter = CertificateCategory | "all";
const PAGE_SIZE = 12;

export function Certifications() {
  const [activeCategory, setActiveCategory] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<CertificateItem | null>(null);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: certificates.length };
    for (const c of certificates) map[c.category] = (map[c.category] ?? 0) + 1;
    return map;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return certificates.filter((c) => {
      if (activeCategory !== "all" && c.category !== activeCategory)
        return false;
      if (!q) return true;
      return `${c.title} ${c.issuer ?? ""}`.toLowerCase().includes(q);
    });
  }, [activeCategory, query]);

  const gridKey = `${activeCategory}::${query.trim().toLowerCase()}`;
  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

  const changeCategory = (category: Filter) => {
    setActiveCategory(category);
    setVisible(PAGE_SIZE);
  };
  const changeQuery = (value: string) => {
    setQuery(value);
    setVisible(PAGE_SIZE);
  };
  const clearFilters = () => {
    setActiveCategory("all");
    setQuery("");
    setVisible(PAGE_SIZE);
  };

  return (
    <Section id="certifications">
      <SectionHeading
        kicker="The learning years"
        title="Certificates & learning"
        description="A big archive from my college and self-learning years — courses & MOOCs, externships, competition wins, and community participation. Filter or search to explore."
      />

      <div className="mb-8 flex flex-col gap-5">
        <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0">
          <legend className="sr-only">Filter certificates by category</legend>
          {certificateCategories.map(({ id, label }) => {
            const isActive = id === activeCategory;
            const count = counts[id] ?? 0;
            if (id !== "all" && count === 0) return null;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isActive}
                onClick={() => changeCategory(id)}
                className={cn(
                  "inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2.5 font-mono text-xs font-medium transition-all duration-300",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
                  isActive
                    ? "bg-gradient-to-r from-accent-500 to-cyan-500 text-white shadow-lg shadow-accent-500/25"
                    : "glass glass-hover text-ink-300 hover:text-white",
                )}
              >
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    isActive ? "bg-white/20" : "bg-white/[0.06] text-ink-400",
                  )}
                >
                  {count}
                </span>
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
              onChange={(event) => changeQuery(event.target.value)}
              placeholder="Search by title or issuer…"
              aria-label="Search certificates"
              className="w-full rounded-2xl bg-transparent py-3 pl-11 pr-12 text-sm text-ink-200 placeholder:text-ink-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => changeQuery("")}
                aria-label="Clear search"
                className="absolute right-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-400 transition-colors duration-300 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <p className="font-mono text-xs text-ink-400">
            <span data-testid="certificates-count" aria-hidden="true">
              <CountUp
                value={filtered.length}
                durationMs={500}
                className="text-accent-300"
              />{" "}
              {filtered.length === 1 ? "certificate" : "certificates"}
            </span>
            <span className="sr-only" role="status">
              {filtered.length}{" "}
              {filtered.length === 1 ? "certificate" : "certificates"}
            </span>
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
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
          >
            {shown.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                onSelect={setSelected}
              />
            ))}
          </motion.div>

          {remaining > 0 && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="glass glass-hover inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-ink-200 transition-all hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
              >
                Show more{" "}
                <span className="text-accent-300">({remaining} left)</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="glass flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <SearchX className="h-6 w-6 text-accent-300" aria-hidden="true" />
          </span>
          <p className="font-display text-lg font-semibold text-white">
            No certificates found
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-1 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent-500 to-cyan-500 px-5 py-2.5 font-mono text-sm font-medium text-white shadow-lg shadow-accent-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-accent-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
          >
            Clear filters
          </button>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <CertificateLightbox
            certificate={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </Section>
  );
}
