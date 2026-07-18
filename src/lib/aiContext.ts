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
 * Builds a compact, factual profile of Qazi from the site's content so the
 * in-browser model can answer grounded questions without any backend.
 */
function buildProfileContext(): string {
  const exp = [...experience, ...earlierExperience]
    .map(
      (e) =>
        `- ${e.role} at ${e.organization} (${e.period}${e.current ? ", current" : ""}): ${e.description}`,
    )
    .join("\n");

  const proj = projects
    .map(
      (p) => `- ${p.title} [${p.category}; ${p.tech.join(", ")}]: ${p.blurb}`,
    )
    .join("\n");

  const skills = skillGroups
    .map((g) => `- ${g.name}: ${g.skills.join(", ")}`)
    .join("\n");

  const edu = education
    .map((e) => `- ${e.degree}, ${e.institution} (${e.period}, ${e.score})`)
    .join("\n");

  const links = socials.map((s) => `${s.label}: ${s.href}`).join(" | ");

  return [
    `Name: ${profile.name}`,
    `Role: ${profile.role} at ${profile.company} (${profile.location})`,
    `Summary: ${profile.intro}`,
    `About:\n${profile.about.map((a) => `- ${a}`).join("\n")}`,
    `Experience:\n${exp}`,
    `Skills:\n${skills}`,
    `Projects:\n${proj}`,
    `Education:\n${edu}`,
    `Achievements: ${achievements.join("; ")}`,
    `Hobbies: ${hobbies.join(", ")}`,
    `Links: ${links}`,
    `Email: ${profile.email}`,
  ].join("\n\n");
}

export const SYSTEM_PROMPT = `You are "${profile.firstName}'s portfolio assistant" — a friendly, concise assistant that answers questions about ${profile.name}, a ${profile.role} at ${profile.company}.

Use ONLY the profile below as your source of truth. If a question isn't covered by it, say you don't have that info and suggest reaching out at ${profile.email}. Keep answers short (1-4 sentences), specific, and in a warm professional tone. Refer to him as "Maaz" or "Qazi". Never invent facts, employers, dates, or projects.

--- PROFILE ---
${buildProfileContext()}
--- END PROFILE ---`;

/** Starter questions shown as clickable chips. */
export const SUGGESTED_PROMPTS = [
  "What does Maaz do at Salesforce?",
  "What's his tech stack?",
  "Show me his best projects",
  "How can I contact him?",
] as const;
