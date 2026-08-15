import {
  experienceYears,
  profile,
  projects,
  skillGroups,
  socials,
} from "@/data/content";
import { celebrateBig, reducedMotion } from "@/lib/confetti";
import { asset } from "@/lib/utils";

const ART = [
  " ██████╗  ███╗   ███╗  █████╗ ",
  "██╔═══██╗ ████╗ ████║ ██╔══██╗",
  "██║   ██║ ██╔████╔██║ ███████║",
  "██║▄▄ ██║ ██║╚██╔╝██║ ██╔══██║",
  "╚██████╔╝ ██║ ╚═╝ ██║ ██║  ██║",
  " ╚══▀▀═╝  ╚═╝     ╚═╝ ╚═╝  ╚═╝",
];

const GRADIENT = [
  "#818cf8",
  "#7b95f9",
  "#6aa8fa",
  "#4fc3f7",
  "#22d3ee",
  "#67e8f9",
];

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const art = (color: string) =>
  `color:${color};font-family:${MONO};font-size:13px;font-weight:700;line-height:1.08;text-shadow:0 0 10px ${color}55`;

const TITLE = `font-family:${MONO};font-size:14px;font-weight:700;color:#f1f5f9`;
const BODY = `font-family:${MONO};font-size:12px;color:#94a3b8`;
const CODE = `font-family:${MONO};font-size:12px;font-weight:700;color:#0b1120;background:#22d3ee;padding:2px 7px;border-radius:5px`;
const LABEL = `font-family:${MONO};font-size:12px;color:#818cf8;font-weight:700`;

function link(id: string): string {
  return socials.find((s) => s.id === id)?.href ?? "";
}

function help(): string {
  console.log(
    `%cqma.*%c — what else is down here:\n\n` +
      `%c  qma.hire()      %cthe surprise (also: hireMaaz())\n` +
      `%c  qma.skills()    %cwhat I build with\n` +
      `%c  qma.projects()  %ca few things I've shipped\n` +
      `%c  qma.contact()   %cevery way to reach me\n` +
      `%c  qma.resume()    %copens the PDF`,
    LABEL,
    BODY,
    CODE,
    BODY,
    CODE,
    BODY,
    CODE,
    BODY,
    CODE,
    BODY,
    CODE,
    BODY,
  );
  return "↑ pick one";
}

function skills(): string {
  console.table(
    Object.fromEntries(
      skillGroups.map((group) => [
        group.name,
        { Stack: group.skills.join(" · ") },
      ]),
    ),
  );
  return `${skillGroups.length} areas, ${experienceYears}+ years.`;
}

function listProjects(): string {
  console.table(
    projects.slice(0, 8).map((project) => ({
      Project: project.title,
      Tech: project.tech.join(" · "),
      Link: project.link ?? "—",
    })),
  );
  return `Showing 8 of ${projects.length}. The rest are in the Projects section.`;
}

function contact(): string {
  console.log(
    `%cReach me%c\n\n` +
      `%c  email     %c${profile.email}\n` +
      `%c  linkedin  %c${link("linkedin")}\n` +
      `%c  github    %c${link("github")}`,
    TITLE,
    BODY,
    LABEL,
    BODY,
    LABEL,
    BODY,
    LABEL,
    BODY,
  );
  return profile.email;
}

function resume(): string {
  const url = new URL(asset(profile.resume), window.location.href).href;
  window.open(url, "_blank", "noopener,noreferrer");
  return url;
}

function hire(): string {
  void celebrateBig();

  // Don't claim confetti fired when reduced motion suppressed it.
  const opener = reducedMotion()
    ? "🎉 You found it."
    : "🎉 Look up — I threw confetti on your screen.";

  console.log(
    `%c${opener}%c\n\n` +
      `%cYou opened the console on a portfolio, which means you're the kind of\n` +
      `engineer who reads the source before believing the marketing. Same.\n\n` +
      `%cI'm ${profile.name} — ${profile.role} at ${profile.company}, ${experienceYears}+ years in.\n` +
      `%c${profile.tagline}\n\n` +
      `%c  ${profile.email}\n  ${link("linkedin")}\n\n` +
      `%cTry %cqma.help()%c for the rest.`,
    TITLE,
    BODY,
    BODY,
    TITLE,
    BODY,
    LABEL,
    BODY,
    CODE,
    BODY,
  );

  return `Seriously though — ${profile.email}`;
}

const qma = { help, hire, skills, projects: listProjects, contact, resume };

declare global {
  interface Window {
    hireMaaz?: typeof hire;
    qma?: typeof qma;
  }
}

/** Once only — hot reload would otherwise reprint the banner every save. */
export function installConsoleEgg(): void {
  if (typeof window === "undefined" || window.qma) return;

  window.qma = qma;
  window.hireMaaz = hire;

  let banner = "";
  const styles: string[] = [];
  for (const [i, line] of ART.entries()) {
    banner += `%c${line}\n`;
    styles.push(art(GRADIENT[i % GRADIENT.length]));
  }

  console.log(banner, ...styles);
  console.log(
    `%cHey sneaky dev! 🕵️‍♂️%c  Inspecting the DOM, are we?\n\n` +
      `%cSince you're here — run %chireMaaz()%c and see what happens.`,
    TITLE,
    BODY,
    BODY,
    CODE,
    BODY,
  );
}
