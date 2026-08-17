import { Search, SearchX, X } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { cn } from "@/lib/utils";

export interface FilterChip {
  readonly id: string;
  readonly label: string;
  readonly count?: number;
}

interface FilterToolbarProps {
  readonly legend: string;
  readonly chips: readonly FilterChip[];
  readonly activeId: string;
  readonly onCategoryChange: (id: string) => void;
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
  readonly searchPlaceholder: string;
  readonly searchAriaLabel: string;
  readonly resultCount: number;
  readonly resultNoun: { singular: string; plural: string };
  readonly countTestId: string;
  /** Hide chips whose count is 0 (except the active/"all" chip). */
  readonly hideEmpty?: boolean;
}

/**
 * Shared category chips + search + live result count used by Projects and
 * Certifications. Keeps the two sections visually and behaviourally aligned
 * without each re-implementing the same fieldset/search chrome.
 */
export function FilterToolbar({
  legend,
  chips,
  activeId,
  onCategoryChange,
  query,
  onQueryChange,
  searchPlaceholder,
  searchAriaLabel,
  resultCount,
  resultNoun,
  countTestId,
  hideEmpty = false,
}: Readonly<FilterToolbarProps>) {
  const noun = resultCount === 1 ? resultNoun.singular : resultNoun.plural;

  return (
    <div className="mb-8 flex flex-col gap-5 sm:mb-10">
      <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0">
        <legend className="sr-only">{legend}</legend>
        {chips.map(({ id, label, count }) => {
          if (hideEmpty && id !== activeId && count === 0) return null;
          const isActive = id === activeId;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onCategoryChange(id)}
              className={cn(
                "inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2.5 font-mono text-xs font-medium transition-all duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
                isActive
                  ? "bg-gradient-to-r from-accent-500 to-cyan-500 text-white shadow-lg shadow-accent-500/25"
                  : "glass glass-hover text-ink-300 hover:text-white",
              )}
            >
              {label}
              {count !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-2xs",
                    isActive ? "bg-white/20" : "bg-white/[0.06] text-ink-400",
                  )}
                >
                  {count}
                </span>
              )}
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
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchAriaLabel}
            className="w-full rounded-2xl bg-transparent py-3 pl-11 pr-12 text-sm text-ink-200 placeholder:text-ink-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className="absolute right-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-400 transition-colors duration-300 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <p className="font-mono text-xs text-ink-400">
          <span data-testid={countTestId} aria-hidden="true">
            <CountUp
              value={resultCount}
              durationMs={500}
              className="text-accent-300"
            />{" "}
            {noun}
          </span>
          <output className="sr-only">
            {resultCount} {noun}
          </output>
        </p>
      </div>
    </div>
  );
}

interface EmptyFilterStateProps {
  readonly title: string;
  readonly description?: string;
  readonly onClear: () => void;
}

export function EmptyFilterState({
  title,
  description,
  onClear,
}: Readonly<EmptyFilterStateProps>) {
  return (
    <div className="glass flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <SearchX className="h-6 w-6 text-accent-300" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-display text-lg font-semibold text-white">{title}</p>
        {description && (
          <p className="max-w-md text-sm text-ink-400">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="mt-1 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent-500 to-cyan-500 px-5 py-2.5 font-mono text-sm font-medium text-white shadow-lg shadow-accent-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-accent-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        Clear filters
      </button>
    </div>
  );
}
