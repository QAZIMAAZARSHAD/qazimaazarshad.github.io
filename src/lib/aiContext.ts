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
  // Include every real link so handles are never invented.
  const links = socials.map((s) => `${s.label} — ${s.href}`).join("\n");

  return [
    `Name: ${profile.name} (goes by "Maaz"). Role: ${profile.role} at ${profile.company}, based in ${profile.location}.`,
    `Summary: ${profile.intro}`,
    `Key facts (do NOT compute or guess beyond these): Maaz has 4+ years of total professional software-engineering experience. He has worked on the R&D MDM team since Aug 2022 — first at Informatica, which was acquired by Salesforce — and his current title is Associate Member of Technical Staff at Salesforce (title held since Mar 2026). If asked "how long at Salesforce", explain the team joined Salesforce through the Informatica acquisition, so it's ~4 years on the team; never state a made-up number of years.`,
    `Current & recent experience:\n${exp}`,
    `Earlier (college-era internships/externships & community roles): ${earlierOrgs}.`,
    `Skills — ${skills}.`,
    `Projects: ${projects.length}+ built, including ${sampleProjects} (full list in the Projects section).`,
    `Education: ${edu.degree}, ${edu.institution} (${edu.period}, ${edu.score}).`,
    `Achievements: ${achievements.join("; ")}.`,
    `Hobbies: ${hobbies.join(", ")}.`,
    `Email: ${profile.email}`,
    `Links & social handles (use these EXACT URLs; never invent a handle. There is no YouTube):\n${links}`,
  ].join("\n\n");
}

export const SYSTEM_PROMPT = `You are the assistant on ${profile.firstName}'s portfolio website. The PROFILE below is your COMPLETE and AUTHORITATIVE knowledge about ${profile.name} — treat it as facts you already know, and answer questions directly and confidently from it. You DO have his profile; never say you lack access to it or to his information.

Rules:
- Reply in 1-3 short sentences of plain, friendly prose. No markdown, no bullet points, no numbered lists, no headings, no bold.
- Be specific and use ONLY the profile. If something genuinely isn't in it, say so briefly and point to his email (${profile.email}).
- Always refer to him as "Maaz". Never invent employers, dates, durations, projects, skills, or social handles.
- When sharing a link or handle, output the EXACT URL from the profile as plain text (e.g. https://...), never a made-up handle and never markdown link syntax.

PROFILE:
${buildProfileContext()}`;

/** Starter questions shown as clickable chips. */
export const SUGGESTED_PROMPTS = [
  "What does Maaz do at Salesforce?",
  "What's his tech stack?",
  "Show me his best projects",
  "How can I contact him?",
] as const;
