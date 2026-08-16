import { useReducedMotion } from "framer-motion";
import { navSections } from "@/data/content";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/utils";

const NAV_IDS = navSections.map((s) => s.id);

export function SideNav() {
  const active = useActiveSection(NAV_IDS);
  const reduceMotion = useReducedMotion();

  const goToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    // The page column is max-w-6xl, so below ~1250px the rail has nowhere to sit
    // that isn't on top of a card. Wait for xl rather than overlap the content.
    <nav
      aria-label="Section navigation"
      className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-4 xl:flex"
    >
      {navSections.map((section) => {
        const isActive = active === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => goToSection(section.id)}
            aria-label={section.label}
            aria-current={isActive ? "location" : undefined}
            className="group relative flex items-center justify-center rounded-full p-2 outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
          >
            <span
              className={cn(
                "absolute right-full mr-3 whitespace-nowrap rounded-md bg-ink-900/90 px-2 py-1 font-mono text-xs text-ink-100 opacity-0 shadow-lg shadow-ink-950/40 ring-1 ring-white/10 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
                reduceMotion && "transition-none",
              )}
              aria-hidden
            >
              {section.label}
            </span>
            <span
              className={cn(
                "block rounded-full transition-all duration-300 ease-out",
                reduceMotion && "transition-none",
                isActive
                  ? "h-3 w-3 bg-accent-400 shadow-[0_0_10px_theme(colors.accent.400)] ring-2 ring-accent-400/30"
                  : "h-2 w-2 bg-ink-600 group-hover:bg-ink-400 group-focus-visible:bg-ink-400",
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
