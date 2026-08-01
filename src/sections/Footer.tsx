import { BackToTop } from "@/components/contact/BackToTop";
import { VisitCounter } from "@/components/analytics/VisitCounter";
import { FooterBackdrop } from "@/components/footer/FooterBackdrop";
import { SignatureName } from "@/components/footer/SignatureName";
import { profile } from "@/data/content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate mt-24 overflow-hidden border-t border-white/10 bg-ink-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-500/60 to-transparent"
      />
      <FooterBackdrop />

      {/* The extra bottom padding on narrow screens keeps the copyright clear of
          the floating Ask AI and back-to-top buttons, which are pinned to the
          viewport and would otherwise sit on top of it at the end of the page. */}
      <div className="relative z-10 px-5 pb-28 pt-14 sm:px-8 sm:pb-10 sm:pt-20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-500">
            EOF — thanks for scrolling
          </p>
          <VisitCounter />
        </div>

        {/* Deliberately wider than the rails around it, but still capped so the
            wordmark can't drift off their axis on ultra-wide displays. */}
        <div className="mx-auto mt-12 max-w-[110rem] sm:mt-16">
          <SignatureName name={profile.name} highlight={profile.firstName} />
        </div>

        <div className="mx-auto mt-8 max-w-6xl">
          <div
            aria-hidden
            className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          <p className="mt-6 text-center font-mono text-[11px] text-ink-500">
            © {year} {profile.name}. All rights reserved.
          </p>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
