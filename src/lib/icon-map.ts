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

const DEFAULT_ICON = Clock;
const DEFAULT_DOMAIN_ICON = Building2;

export function getModuleIcon(iconKey: string): LucideIcon {
  return MODULE_ICONS[iconKey] ?? DEFAULT_ICON;
}

export function getDomainIcon(iconKey: string): LucideIcon {
  return DOMAIN_ICONS[iconKey] ?? DEFAULT_DOMAIN_ICON;
}
