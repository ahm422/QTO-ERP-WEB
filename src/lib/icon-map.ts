import {
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  Factory,
  FolderKanban,
  GraduationCap,
  HardHat,
  HeartPulse,
  Landmark,
  ShoppingBag,
  Smile,
  Star,
  TrendingUp,
  Truck,
  Users,
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

const DOMAIN_ICONS: Record<string, LucideIcon> = {
  factory: Factory,
  landmark: Landmark,
  "heart-pulse": HeartPulse,
  "shopping-bag": ShoppingBag,
  "hard-hat": HardHat,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  truck: Truck,
  "building-2": Building2,
};

/** Icons used by home stats strip. */
export const ALLOWED_STAT_ICON_KEYS = [
  "users",
  "star",
  "smile",
  "building-2",
] as const;

/** Icons used by Built For audience cards. */
export const ALLOWED_BUILT_FOR_ICON_KEYS = [
  "hard-hat",
  "building-2",
  "briefcase",
] as const;

const MARKETING_ICONS: Record<string, LucideIcon> = {
  users: Users,
  star: Star,
  smile: Smile,
  "building-2": Building2,
  "hard-hat": HardHat,
  briefcase: Briefcase,
};

const DEFAULT_ICON = Clock;
const DEFAULT_DOMAIN_ICON = Building2;
const DEFAULT_MARKETING_ICON = Users;

export function getModuleIcon(iconKey: string): LucideIcon {
  return MODULE_ICONS[iconKey] ?? DEFAULT_ICON;
}

export function getDomainIcon(iconKey: string): LucideIcon {
  return DOMAIN_ICONS[iconKey] ?? DEFAULT_DOMAIN_ICON;
}

/** Resolve Lucide icon for home stats (and shared marketing keys). */
export function getStatIcon(iconKey: string): LucideIcon {
  return MARKETING_ICONS[iconKey] ?? DEFAULT_MARKETING_ICON;
}

/** Shared getter for stats + built-for marketing icon keys. */
export function getMarketingIcon(iconKey: string): LucideIcon {
  return MARKETING_ICONS[iconKey] ?? DEFAULT_MARKETING_ICON;
}
