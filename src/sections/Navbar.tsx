import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Menu, Search, X } from "lucide-react";
import { navSections, profile } from "@/data/content";
import { useActiveSection } from "@/hooks/useActiveSection";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { Magnetic } from "@/components/ui/Magnetic";
import { celebrate } from "@/lib/confetti";
import { asset, cn } from "@/lib/utils";

const NAV_IDS = navSections.map((s) => s.id);

const SPY_IDS = ["hero", ...NAV_IDS];

const PILL_SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

function isKeyboardFocus(el: Element): boolean {
  try {
    return el.matches(":focus-visible");
  } catch {
    return false;
  }
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Tracked apart so blurring a keyboard-focused link can't wipe out a
  // highlight the pointer still owns (mouseenter won't fire again to restore it).
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const active = useActiveSection(SPY_IDS);

  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const highlighted = hovered ?? focused ?? active;

  const docked = scrolled && !menuOpen;

  // `preventScroll` is critical: without it, returning focus to the top-of-page
  // toggle scrolls the viewport back up and cancels the in-page anchor
  // navigation triggered by tapping a nav link on mobile.
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus({ preventScroll: true });
  }, []);

  const goToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      setMenuOpen(false);
      // Release the lock up front rather than waiting on the effect cleanup,
      // so it can't still be engaged when we scroll on the next frame.
      document.documentElement.style.overflow = "";
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

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const onChange = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  // The lock has to go on <html>: `html { overflow-x: clip }` stops the body's
  // overflow from propagating to the viewport, so locking the body alone does
  // nothing and the page scrolls behind the open drawer.
  useEffect(() => {
    if (!menuOpen) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [menuOpen]);

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
        "fixed inset-x-0 top-0 z-50",
        menuOpen && "border-b border-white/10 bg-ink-950/95 backdrop-blur-xl",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-ink-950 via-ink-950/85 to-transparent transition-opacity duration-500",
          docked ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        className={cn(
          "transition-[padding] duration-500 ease-[cubic-bezier(0.16,0.84,0.44,1)]",
          docked ? "px-5 pt-3 sm:px-8" : "px-0 pt-0",
        )}
      >
        <div
          data-testid="nav-dock"
          data-docked={docked}
          className={cn(
            // Tracks the page shell's steps so the dock never floats as a small
            // bar over a much wider page on a large monitor.
            "relative mx-auto flex max-w-6xl items-center transition-[height,padding,background-color,border-color,border-radius,box-shadow] duration-500 ease-[cubic-bezier(0.16,0.84,0.44,1)] 2xl:max-w-7xl min-[1920px]:max-w-[88rem]",
            docked
              ? "h-14 rounded-full border border-white/10 bg-ink-950/70 px-4 shadow-2xl shadow-black/50 backdrop-blur-xl"
              : "h-16 rounded-full border border-transparent bg-transparent px-5 sm:h-20 sm:px-8",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/60 to-transparent transition-opacity duration-500",
              docked ? "opacity-100" : "opacity-0",
            )}
          />

          <nav
            aria-label="Primary"
            className="flex w-full items-center justify-between gap-4"
          >
            <a
              href="#hero"
              className="group flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
              aria-label={`${profile.name} — home`}
            >
              <span
                className={cn(
                  "grid place-items-center rounded-xl bg-gradient-to-br from-accent-500 to-cyan-400 font-display font-bold text-white shadow-lg shadow-accent-500/25 transition-all duration-500 group-hover:scale-105",
                  docked ? "h-9 w-9 text-xs" : "h-10 w-10 text-sm",
                )}
              >
                QMA
              </span>
              <span
                className={cn(
                  "hidden overflow-hidden whitespace-nowrap font-display font-semibold text-white transition-all duration-500 sm:block min-[1180px]:hidden",
                  docked
                    ? "max-w-0 text-sm opacity-0"
                    : "max-w-[16rem] text-base opacity-100",
                )}
              >
                {profile.name}
              </span>
            </a>

            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <ul
              className="hidden items-center min-[1180px]:flex"
              onMouseLeave={() => setHovered(null)}
            >
              {navSections.map((section) => {
                const isActive = active === section.id;
                const isLit = highlighted === section.id;
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      aria-current={isActive ? "page" : undefined}
                      onMouseEnter={() => setHovered(section.id)}
                      // Keyboard focus moves the pill; a click must not, or the
                      // clicked link would keep focus and pin the pill there
                      // while you scroll on past that section.
                      onFocus={(e) => {
                        if (isKeyboardFocus(e.currentTarget)) {
                          setFocused(section.id);
                        }
                      }}
                      onBlur={() => setFocused(null)}
                      className={cn(
                        "relative block rounded-full px-2.5 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60",
                        isLit || isActive ? "text-white" : "text-ink-400",
                      )}
                    >
                      {isActive && !isLit && (
                        <span
                          aria-hidden
                          data-testid="nav-active-beam"
                          className="absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent"
                        />
                      )}
                      {isLit && (
                        <motion.span
                          layoutId="nav-pill"
                          aria-hidden
                          data-testid="nav-indicator"
                          transition={PILL_SPRING}
                          className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.07]"
                        >
                          <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
                          <span className="absolute inset-x-4 -bottom-1 h-2 rounded-full bg-cyan-400/25 blur-md" />
                        </motion.span>
                      )}
                      <span className="relative">{section.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="hidden items-center gap-3 min-[1180px]:flex">
              <button
                type="button"
                onClick={openPalette}
                aria-label="Open command palette"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-400 transition-colors duration-300 hover:border-accent-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
              >
                <Search className="h-4 w-4" aria-hidden />
                <kbd className="font-mono text-xs">⌘K</kbd>
              </button>
              <Magnetic strength={0.25} max={8}>
                <a
                  href={resumeHref}
                  target="_blank"
                  rel="noreferrer"
                  download
                  onClick={() => celebrate().catch(() => {})}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition-shadow duration-300 hover:shadow-accent-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  Resume
                </a>
              </Magnetic>
            </div>

            <div className="flex items-center gap-2 min-[1180px]:hidden">
              <button
                type="button"
                onClick={openPalette}
                aria-label="Open command palette"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-ink-200 transition-colors duration-300 hover:border-accent-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
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
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-ink-200 transition-colors duration-300 hover:border-accent-400/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
              >
                {menuOpen ? (
                  <X className="h-5 w-5" aria-hidden />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden />
                )}
              </button>
            </div>
          </nav>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={drawerRef}
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden border-t border-white/10 min-[1180px]:hidden"
          >
            <div className="container-page flex max-h-[calc(100dvh-4rem)] flex-col gap-2 overflow-y-auto py-5">
              <ul className="flex flex-col">
                {navSections.map((section, i) => {
                  const isActive = active === section.id;
                  return (
                    <motion.li
                      key={section.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.25 }}
                    >
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
                    </motion.li>
                  );
                })}
              </ul>

              <a
                href={resumeHref}
                target="_blank"
                rel="noreferrer"
                download
                onClick={() => {
                  closeMenu();
                  celebrate().catch(() => {});
                }}
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
