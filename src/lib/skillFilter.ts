import { projects } from "@/data/content";

/** Match a skill the same way the Projects search does (title + blurb + tech). */
function matches(skill: string): number {
  const q = skill.toLowerCase();
  return projects.filter((p) =>
    `${p.title} ${p.blurb} ${p.tech.join(" ")}`.toLowerCase().includes(q),
  ).length;
}

/** Skills that resolve to at least one project — only these are made clickable. */
export const filterableSkills = new Set<string>();

/** True when clicking the skill would show real results (not a dead end). */
export function isSkillFilterable(skill: string): boolean {
  if (!filterableSkills.has(skill) && matches(skill) > 0) {
    filterableSkills.add(skill);
  }
  return filterableSkills.has(skill);
}

/**
 * Broadcast a project-filter request. The Projects section listens and owns the
 * scroll, so this stays a pure, decoupled event dispatch.
 */
export function filterProjectsBySkill(skill: string): void {
  window.dispatchEvent(
    new CustomEvent("qma:filter-projects", { detail: skill }),
  );
}
