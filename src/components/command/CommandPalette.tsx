import {
  type ComponentType,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  CornerDownLeft,
  ArrowUp,
  ArrowDown,
  User,
  Briefcase,
  Sparkles,
  FolderGit2,
  Wrench,
  GraduationCap,
  Award,
  Mail,
  FileText,
  Copy,
  Check,
  ExternalLink,
  CommandIcon,
} from "lucide-react";
import {
  FaGithub,
  FaLinkedinIn,
  FaInstagram,
  FaXTwitter,
  FaFacebookF,
} from "react-icons/fa6";
import {
  SiLeetcode,
  SiHackerrank,
  SiGeeksforgeeks,
  SiLinktree,
} from "react-icons/si";
import { navSections, profile, socials } from "@/data/content";
import { asset, cn } from "@/lib/utils";

/** Any lucide-react or react-icons component (both accept className + aria-hidden). */
type IconComp = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

interface Command {
  id: string;
  title: string;
  group: "Navigation" | "Actions" | "Social";
  icon: IconComp;
  keywords?: string;
  hint?: string;
  /** Return true to keep the palette open (e.g. to show inline feedback). */
  perform: () => boolean | void;
}

const NAV_ICONS: Record<string, IconComp> = {
  about: User,
  experience: Briefcase,
  earlier: Sparkles,
  projects: FolderGit2,
  skills: Wrench,
  education: GraduationCap,
  achievements: Award,
  contact: Mail,
};

const SOCIAL_ICONS: Record<string, IconComp> = {
  github: FaGithub,
  linkedin: FaLinkedinIn,
  leetcode: SiLeetcode,
  hackerrank: SiHackerrank,
  geeksforgeeks: SiGeeksforgeeks,
  twitter: FaXTwitter,
  instagram: FaInstagram,
  facebook: FaFacebookF,
  linktree: SiLinktree,
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => setOpen(false), []);

  const scrollToSection = useCallback((id: string) => {
    setOpen(false);
    document.body.style.overflow = "";
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    });
  }, []);

  const openExternal = useCallback((url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = navSections.map((s) => ({
      id: `nav-${s.id}`,
      title: `Go to ${s.label}`,
      group: "Navigation",
      icon: NAV_ICONS[s.id] ?? Sparkles,
      keywords: s.label,
      perform: () => scrollToSection(s.id),
    }));

    const actions: Command[] = [
      {
        id: "resume",
        title: "Download résumé",
        group: "Actions",
        icon: FileText,
        keywords: "cv pdf",
        perform: () => openExternal(asset(profile.resume)),
      },
      {
        id: "copy-email",
        title: copied ? "Email copied!" : "Copy email address",
        group: "Actions",
        icon: copied ? Check : Copy,
        keywords: `email ${profile.email}`,
        perform: () => {
          void navigator.clipboard?.writeText(profile.email).catch(() => {});
          setCopied(true);
          if (copyTimer.current) clearTimeout(copyTimer.current);
          copyTimer.current = setTimeout(() => setCopied(false), 1600);
          return true; // keep open to show feedback
        },
      },
      {
        id: "email",
        title: "Send an email",
        group: "Actions",
        icon: Mail,
        keywords: "contact mail reach",
        perform: () => openExternal(`mailto:${profile.email}`),
      },
    ];

    const social: Command[] = socials
      .filter((s) => s.id !== "email")
      .map((s) => ({
        id: `social-${s.id}`,
        title: `Open ${s.label}`,
        group: "Social" as const,
        icon: SOCIAL_ICONS[s.id] ?? ExternalLink,
        keywords: s.label,
        perform: () => openExternal(s.href),
      }));

    return [...nav, ...actions, ...social];
  }, [scrollToSection, openExternal, copied]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.title} ${c.keywords ?? ""} ${c.group}`.toLowerCase().includes(q),
    );
  }, [commands, query]);

  // Reset active row when the result set changes.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Global open shortcut (⌘K / Ctrl+K) + custom event trigger.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, []);

  // On open: lock scroll, focus input, remember previous focus. Restore on close.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      setQuery("");
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.({ preventScroll: true });
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const runCommand = useCallback((cmd: Command) => {
    const keepOpen = cmd.perform();
    if (!keepOpen) setQuery("");
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) runCommand(cmd);
    }
  };

  // Keep the active row scrolled into view.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close command palette"
            onClick={close}
            className="absolute inset-0 cursor-default bg-ink-950/70 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onKeyDown={onKeyDown}
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.18, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="glass relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50"
          >
            {/* Search */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4">
              <Search className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search…"
                aria-label="Search commands"
                className="w-full bg-transparent py-4 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none"
              />
              <kbd className="hidden shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-ink-400 sm:block">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-ink-400">
                  No results for “{query}”.
                </p>
              ) : (
                (["Navigation", "Actions", "Social"] as const).map((group) => {
                  const items = filtered.filter((c) => c.group === group);
                  if (items.length === 0) return null;
                  return (
                    <div key={group} className="mb-1">
                      <p className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-500">
                        {group}
                      </p>
                      {items.map((cmd) => {
                        const index = filtered.indexOf(cmd);
                        const isActive = index === activeIndex;
                        const Icon = cmd.icon;
                        return (
                          <button
                            key={cmd.id}
                            type="button"
                            data-index={index}
                            onMouseMove={() => setActiveIndex(index)}
                            onClick={() => runCommand(cmd)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                              isActive
                                ? "bg-accent-500/15 text-white"
                                : "text-ink-300 hover:text-white",
                            )}
                          >
                            <span
                              className={cn(
                                "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10",
                                isActive ? "bg-accent-500/20 text-accent-200" : "bg-white/[0.03] text-ink-400",
                              )}
                            >
                              <Icon className="h-4 w-4" aria-hidden />
                            </span>
                            <span className="flex-1 truncate">{cmd.title}</span>
                            {isActive && (
                              <CornerDownLeft className="h-3.5 w-3.5 text-ink-500" aria-hidden />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-2.5 text-[11px] text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <CommandIcon className="h-3 w-3" aria-hidden />
                <span className="font-mono">Command palette</span>
              </span>
              <span className="hidden items-center gap-3 sm:flex">
                <span className="inline-flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" aria-hidden />
                  <ArrowDown className="h-3 w-3" aria-hidden /> navigate
                </span>
                <span className="inline-flex items-center gap-1">
                  <CornerDownLeft className="h-3 w-3" aria-hidden /> select
                </span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
