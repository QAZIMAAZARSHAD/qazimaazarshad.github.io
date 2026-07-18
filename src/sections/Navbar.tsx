import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Menu, Search, X } from "lucide-react";
import { navSections, profile } from "@/data/content";
import { useActiveSection } from "@/hooks/useActiveSection";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { asset, cn } from "@/lib/utils";

const NAV_IDS = navSections.map((s) => s.id);

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Include the hero so that, while it is in view, `active === "hero"` and no
  // nav item (none of which use the "hero" id) is highlighted.
  const active = useActiveSection(["hero", ...NAV_IDS]);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close the drawer and return focus to the hamburger toggle.
  // `preventScroll` is critical: without it, returning focus to the top-of-page
  // toggle scrolls the viewport back up and cancels the in-page anchor
  // navigation triggered by tapping a nav link on mobile.
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus({ preventScroll: true });
  }, []);

  // Mobile nav taps: close the drawer, release the body scroll-lock, then
  // scroll to the target ourselves. Doing it manually (instead of relying on
  // the native anchor jump) avoids the race where the lock is still active
  // when the browser tries to scroll — which left navigation broken on mobile.
  const goToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      setMenuOpen(false);
      document.body.style.overflow = "";
      toggleRef.current?.focus({ preventScroll: true });
      requestAnimationFrame(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
      });
    },
    [],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Focus management + focus trap for the mobile drawer.
  useEffect(() => {
    if (!menuOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const getFocusable = () =>
      Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

    // Move focus to the first link when the drawer opens.
    getFocusable()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.key !== "Tab") return;

      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      if (e.shiftKey) {
        if (current === first || !drawer.contains(current)) {
          e.preventDefault();
          last.focus();
        }
      } else if (current === last || !drawer.contains(current)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu]);

  const resumeHref = asset(profile.resume);

  const openPalette = () =>
    window.dispatchEvent(new CustomEvent("open-command-palette"));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || menuOpen
          ? "glass border-b border-white/10"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="container-page flex h-16 items-center justify-between gap-4 sm:h-20"
      >
        <a
          href="#hero"
          className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
          aria-label={`${profile.name} — home`}
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-500 to-cyan-400 font-display text-sm font-bold text-white shadow-lg shadow-accent-500/25 transition-transform duration-300 group-hover:scale-105">
            QMA
          </span>
          <span className="hidden whitespace-nowrap font-display text-base font-semibold text-white sm:block xl:hidden">
            {profile.name}
          </span>
        </a>

        <ul className="hidden items-center gap-1 xl:flex">
          {navSections.map((section) => {
            const isActive = active === section.id;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60",
                    isActive ? "text-white" : "text-ink-400 hover:text-white",
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-dot"
                        className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-accent-400 to-cyan-400"
                      />
                    )}
                    {section.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 xl:flex">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-400 transition-colors duration-300 hover:border-accent-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
          >
            <Search className="h-4 w-4" aria-hidden />
            <kbd className="font-mono text-xs">⌘K</kbd>
          </button>
          <a
            href={resumeHref}
            target="_blank"
            rel="noreferrer"
            download
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-accent-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
          >
            <FileText className="h-4 w-4" aria-hidden />
            Resume
          </a>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-ink-200 transition-colors duration-300 hover:border-accent-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
          >
            <Search className="h-5 w-5" aria-hidden />
          </button>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-ink-200 transition-colors duration-300 hover:border-accent-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={drawerRef}
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden border-t border-white/10 xl:hidden"
          >
            <div className="container-page flex max-h-[calc(100dvh-4rem)] flex-col gap-2 overflow-y-auto py-5">
              <ul className="flex flex-col">
                {navSections.map((section) => {
                  const isActive = active === section.id;
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        onClick={(e) => goToSection(e, section.id)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60",
                          isActive
                            ? "bg-white/[0.06] text-white"
                            : "text-ink-300 hover:bg-white/[0.04] hover:text-white",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full transition-colors",
                            isActive
                              ? "bg-gradient-to-r from-accent-400 to-cyan-400"
                              : "bg-ink-600",
                          )}
                          aria-hidden
                        />
                        {section.label}
                      </a>
                    </li>
                  );
                })}
              </ul>

              <a
                href={resumeHref}
                target="_blank"
                rel="noreferrer"
                download
                onClick={closeMenu}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
              >
                <FileText className="h-4 w-4" aria-hidden />
                Download Resume
              </a>

              <SocialLinks
                className="mt-3 justify-center"
                only={["github", "linkedin", "instagram", "email"]}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
