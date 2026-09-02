/**
 * Code-level defaults for the per-record CMS page-copy columns added to
 * `erp_modules` in migration 0016. Each value is the literal string that was
 * previously hardcoded in `src/app/(site)/erp/[slug]/_components/*` — so a row
 * with every new column NULL renders identically to pre-Phase-2 production.
 *
 * Templates support a `{name}` token replaced with the module name at render.
 */
export type ModulePageDefaults = {
  heroEyebrow: string;
  capabilitiesTag: string;
  capabilitiesDescription: string;
  featuresTag: string;
  featuresSectionDescription: string;
  videoCtaTitleTemplate: string;
  videoCtaDescription: string;
  videoCtaButtonLabel: string;
  problemsTag: string;
  problemsTitleTemplate: string;
  problemsDescription: string;
  faqSectionTag: string;
  faqSectionTitleTemplate: string;
  aboutTag: string;
  aboutSectionHeadings: string[];
  allAppsTag: string;
  allAppsTitle: string;
  ctaHeadline: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  /** Fallback image for feature/about blocks when neither the feature nor the module sets one. */
  defaultImage: string;
};

export const MODULE_PAGE_DEFAULTS: ModulePageDefaults = {
  heroEyebrow: "ERP Module",
  capabilitiesTag: "Capabilities",
  capabilitiesDescription:
    "Three highlights from the module — open the full feature set below.",
  featuresTag: "Features",
  featuresSectionDescription:
    "A powerful set of tools built to give your team full control and visibility.",
  videoCtaTitleTemplate: "See {name} in action",
  videoCtaDescription:
    "Watch a quick overview of all key features and how they work together seamlessly.",
  videoCtaButtonLabel: "Watch Demo",
  problemsTag: "Challenges",
  problemsTitleTemplate: "Problems {name} solves",
  problemsDescription:
    "The day-to-day pain points this module removes — and what it puts in their place.",
  faqSectionTag: "FAQ",
  faqSectionTitleTemplate: "{name} FAQ",
  aboutTag: "About",
  aboutSectionHeadings: ["Overview", "Problem", "Solution", "Results"],
  allAppsTag: "Explore More",
  allAppsTitle: "See All Applications",
  ctaHeadline: "Ready to Simplify Your Operations with QTO ERP?",
  ctaPrimaryLabel: "Schedule a Demo",
  ctaPrimaryHref: "/demo",
  ctaSecondaryLabel: "View Pricing",
  ctaSecondaryHref: "/pricing",
  defaultImage: "/assets/images/attendance.png",
};

/** Replace the `{name}` token in a template string. */
export function applyModuleNameTemplate(template: string, name: string): string {
  return template.replace(/\{name\}/g, name);
}
