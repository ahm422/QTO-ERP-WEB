import {
  Clock,
  Users,
  FolderKanban,
  Building2,
  DollarSign,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const MODULE_ICONS: Record<string, LucideIcon> = {
  clock: Clock,
  users: Users,
  "folder-kanban": FolderKanban,
  "building-2": Building2,
  "dollar-sign": DollarSign,
  "trending-up": TrendingUp,
};

const DEFAULT_ICON = Clock;

export function getModuleIcon(iconKey: string): LucideIcon {
  return MODULE_ICONS[iconKey] ?? DEFAULT_ICON;
}
