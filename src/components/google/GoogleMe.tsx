import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Search, X } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { profile, socials, education, experienceYears } from "@/data/content";
import { trapFocus } from "@/lib/focus";
import { asset } from "@/lib/utils";
import { SocialLinks } from "@/components/ui/SocialLinks";

const SITE_URL = "https://qazimaazarshad.github.io/";
const GOOGLE_SEARCH = `https://www.google.com/search?q=${encodeURIComponent(
  profile.name,
)}`;

const socialHref = (id: string) =>
  socials.find((s) => s.id === id)?.href ?? SITE_URL;

interface SerpResult {
  readonly id: string;
  readonly title: string;
  readonly display: string;
  readonly href: string;
  readonly snippet: string;
  readonly badge?: string;
}

const RESULTS: SerpResult[] = [
  {
    id: "portfolio",
    title: `${profile.name} · ${profile.role}`,
    display: "qazimaazarshad.github.io",
    href: SITE_URL,
    snippet: `${profile.headline}. ${profile.tagline}`,
    badge: "Portfolio",
  },
  {
    id: "linkedin",
    title: `${profile.name} – ${profile.role} – ${profile.company} | LinkedIn`,
    display: "linkedin.com › in › qazimaazarshad",
    href: socialHref("linkedin"),
    snippet: `${profile.role} at ${profile.company}, based in ${profile.location}. ${experienceYears}+ years building enterprise-scale products across backend, BFF & UI — working AI-first.`,
  },
  {
    id: "github",
    title: "qazimaazarshad (Qazi Maaz Arshad) · GitHub",
    display: "github.com › qazimaazarshad",
    href: socialHref("github"),
    snippet:
      "Projects and open-source work — Java, Spring Boot, React & TypeScript. Follow to see repositories and contributions.",
  },
  {
    id: "medium",
    title: "Qazi Maaz Arshad – Medium",
    display: "qazimaazarshad.medium.com",
    href: socialHref("medium"),
    snippet:
      "Developer, Learner, Hustler. Writing on open-source, engineering, and the journey from student to Salesforce.",
  },
  {
    id: "leetcode",
    title: "Qazi Maaz Arshad - LeetCode Profile",
    display: "leetcode.com › qazimaazarshad",
    href: socialHref("leetcode"),
    snippet:
      "300+ problems solved. Data structures, algorithms, and problem solving — 5-star problem solver on HackerRank too.",
  },
];

const KNOWLEDGE_FACTS: { label: string; value: string }[] = [
  { label: "Works at", value: profile.company },
  { label: "Lives in", value: profile.location },
  { label: "Education", value: education[0]?.institution ?? "" },
  { label: "Nationality", value: "Indian" },
];

const GOOGLE_LETTERS: readonly [string, string][] = [
  ["G", "#4285F4"],
  ["o", "#EA4335"],
  ["o", "#FBBC05"],
  ["g", "#4285F4"],
  ["l", "#34A853"],
  ["e", "#EA4335"],
];

function GoogleWordmark() {
  return (
    <span
      role="img"
      aria-label="Google"
      className="select-none font-display text-2xl font-semibold tracking-tight"
    >
      {GOOGLE_LETTERS.map(([char, color], i) => (
        <span key={`${char}-${i}`} aria-hidden style={{ color }}>
          {char}
        </span>
      ))}
    </span>
  );
}

export function GoogleMe() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass glass-hover inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-ink-200 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:text-white hover:shadow-lg hover:shadow-accent-500/20 focus-visible:ring-2 focus-visible:ring-accent-400/60"
      >
        <FcGoogle className="h-4 w-4" aria-hidden />
        Google me
      </button>

      <AnimatePresence>
        {open && <GoogleMeModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

/**
 * Portaled modal that mimics a Google search-results page for the profile.
 * Locks body scroll, marks the app root `inert`, traps Tab focus, closes on
 * Escape/backdrop, and restores focus to the trigger on unmount.
 */
function GoogleMeModal({ onClose }: { readonly onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Capture the trigger BEFORE `inert` blurs it, so focus can be restored.
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = document.getElementById("root");
    root?.setAttribute("inert", "");
    root?.setAttribute("aria-hidden", "true");
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      root?.removeAttribute("inert");
      root?.removeAttribute("aria-hidden");
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      trapFocus(event, dialogRef.current);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-3 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Google search results for ${profile.name}`}
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.26, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative z-10 my-4 w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b1120] shadow-2xl shadow-accent-500/10"
      >
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
          <GoogleWordmark />
          <div className="flex flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
            <span className="font-mono text-sm text-ink-100">
              {profile.name}
            </span>
            <span
              className="ml-0.5 h-4 w-px animate-pulse bg-accent-300"
              aria-hidden
            />
            <span className="ml-auto text-xs text-ink-400" aria-hidden>
              🔍
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-ink-950/70 text-ink-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 sm:static sm:h-10 sm:w-10"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div
          aria-hidden="true"
          className="flex items-center gap-5 border-b border-white/10 px-5 pt-3 font-mono text-xs text-ink-400 sm:px-6"
        >
          {["All", "Images", "News", "Videos", "About"].map((tab, i) => (
            <span
              key={tab}
              className={
                i === 0
                  ? "border-b-2 border-accent-400 pb-2 text-accent-200"
                  : "pb-2"
              }
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5 sm:p-6">
          <p className="mb-5 font-mono text-xs text-ink-400">
            About 42,700 results for “{profile.name}” (0.38 seconds)
          </p>

          <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
            <ol className="flex flex-col gap-6">
              {RESULTS.map((r) => (
                <li key={r.id}>
                  <div className="mb-1 flex items-center gap-2 font-mono text-xs text-ink-400">
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-2xs uppercase text-accent-200">
                      {r.display.charAt(0)}
                    </span>
                    <span className="truncate">{r.display}</span>
                    {r.badge && (
                      <span className="rounded-full bg-accent-500/15 px-2 py-0.5 text-2xs uppercase tracking-wide text-accent-200">
                        {r.badge}
                      </span>
                    )}
                  </div>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5 font-display text-lg text-[#8ab4f8] hover:underline"
                  >
                    {r.title}
                    <ExternalLink
                      className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                  </a>
                  <p className="mt-1 text-sm leading-relaxed text-ink-400">
                    {r.snippet}
                  </p>
                </li>
              ))}
            </ol>

            <aside className="glass h-fit rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <img
                  src={asset(profile.avatar)}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-accent-400/40"
                />
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold leading-tight text-white">
                    {profile.name}
                  </h3>
                  <p className="text-sm text-accent-200/90">
                    {profile.role} at {profile.company}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-ink-300">
                Software engineer at {profile.company} (R&D MDM Informatica),
                building enterprise-scale products across backend, BFF & UI —
                working AI-first.
              </p>

              <dl className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 text-sm">
                {KNOWLEDGE_FACTS.filter((f) => f.value).map((fact) => (
                  <div key={fact.label} className="flex gap-2">
                    <dt className="shrink-0 text-ink-400">{fact.label}:</dt>
                    <dd className="text-ink-200">{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-400">
                  Profiles
                </p>
                <SocialLinks
                  only={[
                    "linkedin",
                    "twitter",
                    "instagram",
                    "facebook",
                    "github",
                  ]}
                />
              </div>
            </aside>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-white/[0.02] p-5 sm:p-6">
          <p className="text-xs text-ink-400">
            A playful preview — try the real thing <span aria-hidden>👇</span>
          </p>
          <a
            href={GOOGLE_SEARCH}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent-500/25 transition-all hover:shadow-accent-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
          >
            <FcGoogle className="h-4 w-4" aria-hidden />
            Open in Google
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
