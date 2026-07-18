import {
  Code2,
  LayoutDashboard,
  Database,
  BrainCircuit,
  Binary,
  Wrench,
  Server,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps the string icon names stored in `skillGroups[].icon` (content.ts)
 * to their concrete lucide-react components. Kept in one typed place so the
 * views never juggle raw icon strings.
 */
const skillIconMap: Record<string, LucideIcon> = {
  Code2,
  LayoutDashboard,
  Database,
  BrainCircuit,
  Binary,
  Wrench,
  Server,
  ShieldCheck,
  Sparkles,
};

/** Resolve a skill-group icon name, falling back to Code2 for safety. */
export function resolveSkillIcon(name: string): LucideIcon {
  return skillIconMap[name] ?? Code2;
}
