import { motion } from "framer-motion";
import {
  Award,
  Briefcase,
  Eye,
  GraduationCap,
  Ticket,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { CertificateCategory, CertificateItem } from "@/data/content";
import { asset, cn } from "@/lib/utils";
import { scaleIn } from "@/lib/motion";

const CATEGORY_META: Record<
  CertificateCategory,
  { icon: LucideIcon; label: string }
> = {
  course: { icon: GraduationCap, label: "Course" },
  externship: { icon: Briefcase, label: "Externship" },
  achievement: { icon: Trophy, label: "Achievement" },
  participation: { icon: Ticket, label: "Participation" },
  other: { icon: Award, label: "Certificate" },
};

interface CertificateCardProps {
  readonly certificate: CertificateItem;
  readonly onSelect: (certificate: CertificateItem) => void;
}

export function CertificateCard({
  certificate,
  onSelect,
}: CertificateCardProps) {
  const { title, issuer, category, preview } = certificate;
  const { icon: Icon, label } = CATEGORY_META[category];

  return (
    <motion.button
      type="button"
      variants={scaleIn}
      onClick={() => onSelect(certificate)}
      aria-label={`View certificate: ${title}`}
      className={cn(
        "group glass glass-hover flex h-full flex-col overflow-hidden rounded-2xl text-left",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent-500/15",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-900/60">
        {preview ? (
          <img
            src={asset(preview)}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-ink-600">
            <Icon className="h-10 w-10" aria-hidden />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-ink-950/70 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-200 backdrop-blur">
          <Icon className="h-3 w-3" aria-hidden />
          {label}
        </span>

        <span className="absolute bottom-2 right-2 inline-flex translate-y-2 items-center gap-1 rounded-full bg-gradient-to-r from-accent-500 to-cyan-500 px-2.5 py-1 font-mono text-[10px] font-medium text-white opacity-0 shadow-lg shadow-accent-500/30 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Eye className="h-3 w-3" aria-hidden />
          View
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3
          className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors duration-300 group-hover:text-accent-200"
          title={title}
        >
          {title}
        </h3>
        {issuer && (
          <p className="mt-0.5 truncate text-xs text-ink-400" title={issuer}>
            {issuer}
          </p>
        )}
      </div>
    </motion.button>
  );
}
