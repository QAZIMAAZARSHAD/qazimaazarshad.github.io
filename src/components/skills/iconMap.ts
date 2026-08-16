import {
  Code2,
  LayoutDashboard,
  Binary,
  Wrench,
  Server,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const skillIconMap: Record<string, LucideIcon> = {
  Code2,
  LayoutDashboard,
  Binary,
  Wrench,
  Server,
  ShieldCheck,
  Sparkles,
};

export function resolveSkillIcon(name: string): LucideIcon {
  return skillIconMap[name] ?? Code2;
}
