export type IndustryDomain = {
  id: string;
  order: number;
  name: string;
  systemCount: number;
  description: string;
  leaders: string[];
  iconKey: string;
  /** Explore CTA; when omitted, UI falls back to `/allApps`. */
  href?: string;
};

/**
 * Static industry-domain marketing copy for the homepage explorer.
 * Single source of truth — do not hardcode domain strings in JSX.
 */
export const INDUSTRY_DOMAINS: IndustryDomain[] = [
  {
    id: "manufacturing",
    order: 1,
    name: "Manufacturing",
    systemCount: 12,
    description:
      "Connect shop-floor execution, inventory, quality, and finance so production plans stay aligned with capacity, materials, and margin.",
    leaders: ["ForgeWorks", "Apex Assemblies", "Northline Plants"],
    iconKey: "factory",
  },
  {
    id: "finance-accounting",
    order: 2,
    name: "Finance & Accounting",
    systemCount: 9,
    description:
      "Unify GL, AP/AR, multi-entity consolidation, and close workflows with real-time visibility across every operating company.",
    leaders: ["LedgerPeak", "Summit Controllers", "ClearTrail CFO"],
    iconKey: "landmark",
  },
  {
    id: "healthcare",
    order: 3,
    name: "Healthcare",
    systemCount: 8,
    description:
      "Coordinate staffing, compliance documentation, patient-ops scheduling, and supply chains without fragmenting clinical teams.",
    leaders: ["CareAxis Clinics", "VitalPath Groups", "Harbor Health"],
    iconKey: "heart-pulse",
  },
  {
    id: "retail",
    order: 4,
    name: "Retail",
    systemCount: 11,
    description:
      "Run omnichannel inventory, store operations, promotions, and fulfillment from one suite built for high-velocity merchandise cycles.",
    leaders: ["ShelfLine Co.", "Urban Merchants", "BrightAisle"],
    iconKey: "shopping-bag",
  },
  {
    id: "construction",
    order: 5,
    name: "Construction",
    systemCount: 10,
    description:
      "Track jobs, crews, equipment, change orders, and project costing so field progress stays tied to the commercial plan.",
    leaders: ["RidgeBuild", "Cornerstone Works", "Pinnacle Sites"],
    iconKey: "hard-hat",
  },
  {
    id: "professional-services",
    order: 6,
    name: "Professional Services",
    systemCount: 7,
    description:
      "Plan utilization, projects, time, and billing together so delivery teams protect margin while clients get predictable outcomes.",
    leaders: ["Vector Advisory", "Keystone Partners", "Orbit Consulting"],
    iconKey: "briefcase",
  },
  {
    id: "education",
    order: 7,
    name: "Education",
    systemCount: 6,
    description:
      "Manage campuses, staff, schedules, and administrative workflows with clear oversight across departments and locations.",
    leaders: ["Lumen Academies", "ScholarGate", "Campus North"],
    iconKey: "graduation-cap",
  },
  {
    id: "logistics-supply-chain",
    order: 8,
    name: "Logistics & Supply Chain",
    systemCount: 14,
    description:
      "Orchestrate procurement, warehousing, carriers, and demand signals so goods move on time with fewer stockouts and exceptions.",
    leaders: ["Transitora", "BlueRoute Logistics", "CargoNest"],
    iconKey: "truck",
  },
].sort((a, b) => a.order - b.order);

export function getIndustryDomains(): IndustryDomain[] {
  return INDUSTRY_DOMAINS;
}

export function getIndustryDomainById(
  id: string
): IndustryDomain | undefined {
  return INDUSTRY_DOMAINS.find((domain) => domain.id === id);
}
