import {
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  DollarSign,
  Factory,
  FolderKanban,
  GraduationCap,
  HardHat,
  HeartPulse,
  Landmark,
  Lightbulb,
  LineChart,
  Mail,
  MessageCircle,
  Phone,
  Rocket,
  Settings2,
  Shield,
  ShoppingBag,
  Smile,
  Star,
  Target,
  TrendingUp,
  Truck,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { CMS_ICONS } from "@/lib/cms-icons";

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

/** Icons used by Connected Ecosystem industry domains. */
export const ALLOWED_DOMAIN_ICON_KEYS = [
  "factory",
  "landmark",
  "heart-pulse",
  "shopping-bag",
  "hard-hat",
  "briefcase",
  "graduation-cap",
  "truck",
  "building-2",
] as const;

/** Icons used by /demo CMS process steps + form-side benefits. */
export const ALLOWED_DEMO_ICON_KEYS = [
  "clock",
  "users",
  "zap",
  "check-circle-2",
  "target",
] as const;

/** Icons used by /about story callout. */
export const ALLOWED_ABOUT_ICON_KEYS = ["lightbulb"] as const;

/** Icons used by /contact support cards + channels. */
export const ALLOWED_CONTACT_ICON_KEYS = [
  "clock",
  "shield",
  "message-circle",
  "zap",
  "mail",
  "phone",
  "building-2",
] as const;

/** Icons used by module rollout pipeline steps. */
export const ALLOWED_ROLLOUT_ICON_KEYS = [
  "clipboard-check",
  "settings-2",
  "rocket",
  "line-chart",
] as const;

const MARKETING_ICONS: Record<string, LucideIcon> = {
  users: Users,
  star: Star,
  smile: Smile,
  "building-2": Building2,
  "hard-hat": HardHat,
  briefcase: Briefcase,
};

const DEMO_ICONS: Record<string, LucideIcon> = {
  clock: Clock,
  users: Users,
  zap: Zap,
  "check-circle-2": CheckCircle2,
  target: Target,
};

const ABOUT_ICONS: Record<string, LucideIcon> = {
  lightbulb: Lightbulb,
};

const CONTACT_ICONS: Record<string, LucideIcon> = {
  clock: Clock,
  shield: Shield,
  "message-circle": MessageCircle,
  zap: Zap,
  mail: Mail,
  phone: Phone,
  "building-2": Building2,
};

const ROLLOUT_ICONS: Record<string, LucideIcon> = {
  "clipboard-check": ClipboardCheck,
  "settings-2": Settings2,
  rocket: Rocket,
  "line-chart": LineChart,
};

const DEFAULT_ICON = Clock;
const DEFAULT_DOMAIN_ICON = Building2;
const DEFAULT_MARKETING_ICON = Users;
const DEFAULT_DEMO_ICON = Clock;
const DEFAULT_ABOUT_ICON = Lightbulb;
const DEFAULT_CONTACT_ICON = Mail;
const DEFAULT_ROLLOUT_ICON = ClipboardCheck;

export function getModuleIcon(iconKey: string): LucideIcon {
  return (
    CMS_ICONS[iconKey]?.Icon ?? MODULE_ICONS[iconKey] ?? DEFAULT_ICON
  );
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

/** Resolve Lucide icon for demo page CMS steps / benefits. */
export function getDemoIcon(iconKey: string): LucideIcon {
  return DEMO_ICONS[iconKey] ?? DEFAULT_DEMO_ICON;
}

/** Resolve Lucide icon for about page CMS callouts. */
export function getAboutIcon(iconKey: string): LucideIcon {
  return ABOUT_ICONS[iconKey] ?? DEFAULT_ABOUT_ICON;
}

/** Resolve Lucide icon for contact support cards / channels. */
export function getContactIcon(iconKey: string): LucideIcon {
  return CONTACT_ICONS[iconKey] ?? DEFAULT_CONTACT_ICON;
}

/** Resolve Lucide icon for module rollout pipeline steps. */
export function getRolloutIcon(iconKey: string): LucideIcon {
  return (
    CMS_ICONS[iconKey]?.Icon ?? ROLLOUT_ICONS[iconKey] ?? DEFAULT_ROLLOUT_ICON
  );
}
