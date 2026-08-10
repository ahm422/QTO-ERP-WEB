/**
 * Defaults for Connected Ecosystem industry domains.
 * Used by seed + runtime fallback when D1 rows are missing.
 */

export type IndustryDomainDefault = {
  slug: string;
  name: string;
  orderIndex: string;
  systemsCount: number;
  iconKey: string;
  description: string;
  leaders: string[];
  ctaLabel: string | null;
  ctaUrl: string | null;
  sortOrder: number;
  published: boolean;
};

export const INDUSTRY_DOMAINS_DEFAULTS: IndustryDomainDefault[] = [
  {
    slug: "manufacturing",
    name: "Manufacturing",
    orderIndex: "01",
    systemsCount: 12,
    iconKey: "factory",
    description:
      "Connect shop-floor execution, inventory, quality, and finance so production plans stay aligned with capacity, materials, and margin.",
    leaders: ["ForgeWorks", "Apex Assemblies", "Northline Plants"],
    ctaLabel: null,
    ctaUrl: null,
    sortOrder: 0,
    published: true,
  },
  {
    slug: "finance-accounting",
    name: "Finance & Accounting",
    orderIndex: "02",
    systemsCount: 9,
    iconKey: "landmark",
    description:
      "Unify GL, AP/AR, multi-entity consolidation, and close workflows with real-time visibility across every operating company.",
    leaders: ["LedgerPeak", "Summit Controllers", "ClearTrail CFO"],
    ctaLabel: null,
    ctaUrl: null,
    sortOrder: 1,
    published: true,
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    orderIndex: "03",
    systemsCount: 8,
    iconKey: "heart-pulse",
    description:
      "Coordinate staffing, compliance documentation, patient-ops scheduling, and supply chains without fragmenting clinical teams.",
    leaders: ["CareAxis Clinics", "VitalPath Groups", "Harbor Health"],
    ctaLabel: null,
    ctaUrl: null,
    sortOrder: 2,
    published: true,
  },
  {
    slug: "retail",
    name: "Retail",
    orderIndex: "04",
    systemsCount: 11,
    iconKey: "shopping-bag",
    description:
      "Run omnichannel inventory, store operations, promotions, and fulfillment from one suite built for high-velocity merchandise cycles.",
    leaders: ["ShelfLine Co.", "Urban Merchants", "BrightAisle"],
    ctaLabel: null,
    ctaUrl: null,
    sortOrder: 3,
    published: true,
  },
  {
    slug: "construction",
    name: "Construction",
    orderIndex: "05",
    systemsCount: 10,
    iconKey: "hard-hat",
    description:
      "Track jobs, crews, equipment, change orders, and project costing so field progress stays tied to the commercial plan.",
    leaders: ["RidgeBuild", "Cornerstone Works", "Pinnacle Sites"],
    ctaLabel: null,
    ctaUrl: null,
    sortOrder: 4,
    published: true,
  },
  {
    slug: "professional-services",
    name: "Professional Services",
    orderIndex: "06",
    systemsCount: 7,
    iconKey: "briefcase",
    description:
      "Plan utilization, projects, time, and billing together so delivery teams protect margin while clients get predictable outcomes.",
    leaders: ["Vector Advisory", "Keystone Partners", "Orbit Consulting"],
    ctaLabel: null,
    ctaUrl: null,
    sortOrder: 5,
    published: true,
  },
  {
    slug: "education",
    name: "Education",
    orderIndex: "07",
    systemsCount: 6,
    iconKey: "graduation-cap",
    description:
      "Manage campuses, staff, schedules, and administrative workflows with clear oversight across departments and locations.",
    leaders: ["Lumen Academies", "ScholarGate", "Campus North"],
    ctaLabel: null,
    ctaUrl: null,
    sortOrder: 6,
    published: true,
  },
  {
    slug: "logistics-supply-chain",
    name: "Logistics & Supply Chain",
    orderIndex: "08",
    systemsCount: 14,
    iconKey: "truck",
    description:
      "Orchestrate procurement, warehousing, carriers, and demand signals so goods move on time with fewer stockouts and exceptions.",
    leaders: ["Transitora", "BlueRoute Logistics", "CargoNest"],
    ctaLabel: null,
    ctaUrl: null,
    sortOrder: 7,
    published: true,
  },
];

/** Zero-pad display index from 0-based sort position ("01", "02", …). */
export function orderIndexFromSortOrder(sortOrder: number): string {
  return String(sortOrder + 1).padStart(2, "0");
}
