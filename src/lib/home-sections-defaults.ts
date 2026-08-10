import { QTO_HOUSE_URL, QTO_SOLUTIONS_URL } from "@/lib/constants";

/**
 * Defaults for home Trusted By / Stats / Built For CMS sections.
 * Used by seed + runtime fallback when D1 rows are missing.
 *
 * Phase 5: section headers (Integrated Modules, Ecosystems, FAQ, …) add rows to
 * `home_sections`. Freeform CTA singletons use site_settings JSON
 * (e.g. home_final_cta). Keep home_hero as the rich typed singleton pattern.
 *
 * Dual FAQ patterns:
 * A — Shared page FAQs in the `faqs` table (pageKey); home FAQ header here.
 * B — Entity-embedded FAQs in erp_modules.faqs / solutions.solution_faqs JSON
 *     (module + solution detail pages) — intentionally not migrated.
 */

export const BUILT_FOR_SECTION_KEY = "built_for" as const;
export const ECOSYSTEM_SECTION_KEY = "ecosystem" as const;
export const FAQ_SECTION_KEY = "faq" as const;

export const TRUSTED_LOGO_QTO_HOUSE_KEY = "trusted-logos/qto-house.svg";
export const TRUSTED_LOGO_QTO_SOLUTIONS_KEY = "trusted-logos/qto-solutions.avif";

export type TrustedLogoDefault = {
  name: string;
  logoImageKey: string | null;
  linkUrl: string | null;
  sortOrder: number;
  published: boolean;
};

export type HomeStatDefault = {
  label: string;
  value: number;
  suffix: string;
  iconKey: string;
  sortOrder: number;
  published: boolean;
};

export type BuiltForCardDefault = {
  title: string;
  description: string;
  iconKey: string;
  sortOrder: number;
  published: boolean;
};

export type HomeSectionDefault = {
  sectionKey: string;
  tag: string;
  title: string;
  accent: string;
  description: string;
};

/**
 * Brand logos only (R2 keys). Seed uploads House/Solutions assets when R2 is available.
 */
export const TRUSTED_LOGOS_DEFAULTS: TrustedLogoDefault[] = [
  {
    name: "QTO House",
    logoImageKey: TRUSTED_LOGO_QTO_HOUSE_KEY,
    linkUrl: QTO_HOUSE_URL,
    sortOrder: 0,
    published: true,
  },
  {
    name: "QTO Solutions",
    logoImageKey: TRUSTED_LOGO_QTO_SOLUTIONS_KEY,
    linkUrl: QTO_SOLUTIONS_URL,
    sortOrder: 1,
    published: true,
  },
];

export const HOME_STATS_DEFAULTS: HomeStatDefault[] = [
  {
    label: "Active Users",
    value: 10,
    suffix: "K+",
    iconKey: "users",
    sortOrder: 0,
    published: true,
  },
  {
    label: "Average Rating",
    value: 4.9,
    suffix: "+",
    iconKey: "star",
    sortOrder: 1,
    published: true,
  },
  {
    label: "Satisfaction",
    value: 99,
    suffix: "%",
    iconKey: "smile",
    sortOrder: 2,
    published: true,
  },
  {
    label: "Companies",
    value: 150,
    suffix: "+",
    iconKey: "building-2",
    sortOrder: 3,
    published: true,
  },
];

export const BUILT_FOR_SECTION_DEFAULT: HomeSectionDefault = {
  sectionKey: BUILT_FOR_SECTION_KEY,
  tag: "Built for",
  title: "Built for field &",
  accent: "office",
  description:
    "One platform for crews on site and teams coordinating from HQ — shared data, shared truth.",
};

export const BUILT_FOR_CARDS_DEFAULTS: BuiltForCardDefault[] = [
  {
    title: "Field crews",
    description:
      "Attendance, tasks, and site readiness without spreadsheet chaos.",
    iconKey: "hard-hat",
    sortOrder: 0,
    published: true,
  },
  {
    title: "Office ops",
    description:
      "HR, inventory, and project controls that stay in sync with the field.",
    iconKey: "building-2",
    sortOrder: 1,
    published: true,
  },
  {
    title: "Controllers",
    description:
      "Labor and material visibility before costs overrun the bid.",
    iconKey: "briefcase",
    sortOrder: 2,
    published: true,
  },
];

export const ECOSYSTEM_SECTION_DEFAULT: HomeSectionDefault = {
  sectionKey: ECOSYSTEM_SECTION_KEY,
  tag: "Ecosystem",
  title: "Connected",
  accent: "Ecosystem",
  description:
    "See how QTO House modules map to the industries you operate in — pick a domain to preview systems, leaders, and next steps.",
};
