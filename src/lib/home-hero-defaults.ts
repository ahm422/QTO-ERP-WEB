import { QTO_DEV_URL } from "@/lib/constants";
import type { HomeHero } from "@/types/content";

/** Fixed singleton row id for home_hero. */
export const HOME_HERO_ID = "default" as const;

/** Production hero copy — seed + runtime fallback when row is missing. */
export const HOME_HERO_DEFAULTS: HomeHero = {
  eyebrowText: "The Modern ERP Platform",
  titleLine1: "The Modern ERP for",
  titleAccent: "Growing Teams",
  subtitle:
    "Attendance, HR, and Project Management — unified in one powerful platform.",
  bullets: [
    "Track time & attendance in real-time",
    "Manage your entire workforce lifecycle",
    "Deliver projects on time, every time",
  ],
  primaryCtaLabel: "Book a Demo",
  primaryCtaUrl: "/demo",
  secondaryCtaLabel: "See Pricing",
  secondaryCtaUrl: "/pricing",
  poweredByText: "A product by QTO Dev",
  poweredByUrl: QTO_DEV_URL,
};

/**
 * Orbit layout tuples from the previous hardcoded DEFAULT_MODULES,
 * keyed by live erp_modules slugs (not the old hr/pm/crm ids).
 */
export const ORBIT_SEED_BY_SLUG: Record<
  string,
  [number, number, number, number]
> = {
  attendance: [2.05, 0.4, 0.4, 0.28],
  hrm: [2.05, -0.45, 2.1, 0.22],
  "project-management": [2.45, 0.55, 3.6, 0.18],
  crms: [2.45, -0.3, 5.1, 0.24],
};

/** Index-based fallback when a published module has no orbit overrides. */
export const ORBIT_INDEX_DEFAULTS: [number, number, number, number][] = [
  [2.05, 0.4, 0.4, 0.28],
  [2.05, -0.45, 2.1, 0.22],
  [2.45, 0.55, 3.6, 0.18],
  [2.45, -0.3, 5.1, 0.24],
  [2.25, 0.25, 1.2, 0.2],
  [2.35, -0.35, 4.2, 0.26],
];
