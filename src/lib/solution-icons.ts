import { Briefcase, Sparkles, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Per-solution icon; unknown (newly added CMS) solutions fall back to Sparkles. */
const SOLUTION_ICON_MAP: Record<string, LucideIcon> = {
  "hr-teams": Users,
  "project-teams": Briefcase,
  owners: TrendingUp,
};

export function getSolutionIcon(slug: string): LucideIcon {
  return SOLUTION_ICON_MAP[slug] ?? Sparkles;
}
