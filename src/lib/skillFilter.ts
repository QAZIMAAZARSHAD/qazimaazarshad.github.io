import { projects } from "@/data/content";

function matches(skill: string): number {
  const q = skill.toLowerCase();
  return projects.filter((p) =>
    `${p.title} ${p.blurb} ${p.tech.join(" ")}`.toLowerCase().includes(q),
  ).length;
}

const filterableSkills = new Set<string>();

export function isSkillFilterable(skill: string): boolean {
  if (!filterableSkills.has(skill) && matches(skill) > 0) {
    filterableSkills.add(skill);
  }
  return filterableSkills.has(skill);
}

export function filterProjectsBySkill(skill: string): void {
  window.dispatchEvent(
    new CustomEvent("qma:filter-projects", { detail: skill }),
  );
}
