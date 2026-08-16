import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyFilterState, FilterToolbar } from "@/components/ui/FilterToolbar";
import { CertificateCard } from "@/components/certificates/CertificateCard";
import { CertificateLightbox } from "@/components/certificates/CertificateLightbox";
import {
  certificateCategories,
  type CertificateCategory,
  type CertificateItem,
} from "@/data/content";
import { certificates } from "@/data/certificates";
import { staggerContainer } from "@/lib/motion";

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

  const changeCategory = (category: string) => {
    setActiveCategory(category as Filter);
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

      <FilterToolbar
        legend="Filter certificates by category"
        chips={certificateCategories.map(({ id, label }) => ({
          id,
          label,
          count: counts[id] ?? 0,
        }))}
        activeId={activeCategory}
        onCategoryChange={changeCategory}
        query={query}
        onQueryChange={changeQuery}
        searchPlaceholder="Search by title or issuer…"
        searchAriaLabel="Search certificates"
        resultCount={filtered.length}
        resultNoun={{ singular: "certificate", plural: "certificates" }}
        countTestId="certificates-count"
        hideEmpty
      />

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
                className="glass glass-hover inline-flex items-center gap-1.5 rounded-full px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-ink-200 transition-all hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
              >
                Show more{" "}
                <span className="text-accent-300">({remaining} left)</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyFilterState
          title="No certificates found"
          onClear={clearFilters}
        />
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
