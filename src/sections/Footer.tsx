import { MapPin } from "lucide-react";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { BackToTop } from "@/components/contact/BackToTop";
import { navSections, profile } from "@/data/content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-ink-950/60">
      {/* Gradient hairline accent along the top border */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent"
      />

      <div className="container-page py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-5">
            <a
              href="#hero"
              className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent-500 to-cyan-500 font-display text-sm font-bold tracking-tight text-white shadow-lg shadow-accent-500/25">
                QMA
              </span>
              <span className="font-display text-lg font-semibold text-white">
                {profile.name}
              </span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-400">
              {profile.tagline}
            </p>
            <p className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-500">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {profile.location}
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer navigation" className="lg:col-span-4">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent-300">
              Explore
            </h3>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
              {navSections.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="group inline-flex items-center gap-2 text-sm text-ink-400 transition-colors duration-300 hover:text-white"
                  >
                    <span
                      aria-hidden
                      className="h-1 w-1 rounded-full bg-accent-500/60 transition-all duration-300 group-hover:w-3 group-hover:bg-cyan-400"
                    />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect */}
          <div className="lg:col-span-3">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent-300">
              Connect
            </h3>
            <SocialLinks
              className="mt-5"
              only={["linkedin", "instagram", "twitter", "email"]}
            />
            <a
              href={`mailto:${profile.email}`}
              className="mt-5 block font-mono text-xs text-ink-500 underline-offset-4 transition-colors hover:text-accent-300 hover:underline"
            >
              {profile.email}
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-3 border-t border-white/10 pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-ink-400">
            &copy; {year} {profile.name}. All rights reserved.
          </p>
          <p className="font-mono text-xs text-ink-500">
            Built with React, TypeScript &amp; Tailwind.
          </p>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
