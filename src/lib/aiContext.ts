import {
  profile,
  experience,
  earlierExperience,
  projects,
  skillGroups,
  education,
  achievements,
  hobbies,
  socials,
} from "@/data/content";

/**
 * Builds a compact, factual profile of Maaz from the site's content. Kept tight
 * (no exhaustive dumps) so a small in-browser model can actually use it well.
 */
function buildProfileContext(): string {
  const exp = experience
    .map((c) => {
      const roles = c.roles.map((r) => `${r.title} (${r.period})`).join(", ");
      const tenure = c.totalDuration ? `, ${c.totalDuration}` : "";
      const current = c.current ? " (current)" : "";
      return `- ${c.organization}${tenure}${current}: ${c.description ?? ""} Roles: ${roles}.`;
    })
    .join("\n");

  // Summarise earlier roles rather than listing all of them.
  const earlierOrgs = [
    ...new Set(earlierExperience.map((e) => e.organization.split(" — ")[0])),
  ]
    .slice(0, 8)
    .join(", ");

  const skills = skillGroups
    .map((g) => `${g.name}: ${g.skills.join(", ")}`)
    .join("; ");

  const sampleProjects = projects
    .slice(0, 6)
    .map((p) => p.title)
    .join(", ");

  const edu = education[0];
  const links = socials
    .filter((s) => ["linkedin", "github", "email"].includes(s.id))
    .map((s) => `${s.label}: ${s.href}`)
    .join(" | ");

  return [
    `Name: ${profile.name} (goes by "Maaz"). Role: ${profile.role} at ${profile.company}, based in ${profile.location}.`,
    `Summary: ${profile.intro}`,
    `Current & recent experience:\n${exp}`,
    `Earlier (college-era internships/externships & community roles): ${earlierOrgs}.`,
    `Skills — ${skills}.`,
    `Projects: ${projects.length}+ built, including ${sampleProjects} (full list in the Projects section).`,
    `Education: ${edu.degree}, ${edu.institution} (${edu.period}, ${edu.score}).`,
    `Achievements: ${achievements.join("; ")}.`,
    `Hobbies: ${hobbies.join(", ")}.`,
    `Contact — Email: ${profile.email}. ${links}.`,
  ].join("\n\n");
}

export const SYSTEM_PROMPT = `You are the assistant on ${profile.firstName}'s portfolio website. The PROFILE below is your COMPLETE and AUTHORITATIVE knowledge about ${profile.name} — treat it as facts you already know, and answer questions directly and confidently from it. You DO have his profile; never say you lack access to it or to his information.

Rules:
- Reply in 1-3 short sentences of plain, friendly prose. No markdown, no bullet points, no numbered lists, no headings, no bold.
- Be specific and use ONLY the profile. If something genuinely isn't in it, say so briefly and point to his email (${profile.email}).
- Always refer to him as "Maaz". Never invent employers, dates, projects, or skills.

PROFILE:
${buildProfileContext()}`;

/** Starter questions shown as clickable chips. */
export const SUGGESTED_PROMPTS = [
  "What does Maaz do at Salesforce?",
  "What's his tech stack?",
  "Show me his best projects",
  "How can I contact him?",
] as const;
