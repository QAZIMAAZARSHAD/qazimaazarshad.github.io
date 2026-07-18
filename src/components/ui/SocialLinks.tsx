import type { IconType } from "react-icons";
import {
  FaLinkedinIn,
  FaGithub,
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
  FaEnvelope,
} from "react-icons/fa6";
import {
  SiLeetcode,
  SiHackerrank,
  SiGeeksforgeeks,
  SiLinktree,
} from "react-icons/si";
import { socials, type SocialId } from "@/data/content";
import { cn } from "@/lib/utils";

const ICONS: Record<SocialId, IconType> = {
  linkedin: FaLinkedinIn,
  github: FaGithub,
  leetcode: SiLeetcode,
  hackerrank: SiHackerrank,
  geeksforgeeks: SiGeeksforgeeks,
  twitter: FaXTwitter,
  instagram: FaInstagram,
  facebook: FaFacebookF,
  linktree: SiLinktree,
  email: FaEnvelope,
};

interface SocialLinksProps {
  className?: string;
  iconClassName?: string;
  /** Restrict to a subset of platforms, in the given order. */
  only?: SocialId[];
}

export function SocialLinks({
  className,
  iconClassName,
  only,
}: SocialLinksProps) {
  const items = only
    ? only
        .map((id) => socials.find((s) => s.id === id))
        .filter((s): s is (typeof socials)[number] => Boolean(s))
    : socials;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {items.map((social) => {
        const Icon = ICONS[social.id];
        return (
          <a
            key={social.id}
            href={social.href}
            target={social.id === "email" ? undefined : "_blank"}
            rel="noreferrer"
            aria-label={social.label}
            title={social.label}
            className={cn(
              "group grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-ink-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-400/50 hover:text-white hover:shadow-lg hover:shadow-accent-500/20",
              iconClassName,
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </a>
        );
      })}
    </div>
  );
}
