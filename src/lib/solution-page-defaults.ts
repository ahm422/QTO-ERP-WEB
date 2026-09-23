/**
 * Code-level defaults for the per-record CMS page-copy columns added to
 * `solutions` in migration 0016. Each value is the literal string previously
 * hardcoded in `src/app/(site)/solution/[slug]/**` — a row with every new
 * column NULL renders identically to pre-Phase-2 production.
 *
 * `heroCaptionTemplate` supports a `{title}` token (lowercased solution title).
 */
export type SolutionPageDefaults = {
  heroEyebrow: string;
  heroCaptionTemplate: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  tabsIntroTag: string;
  tabsIntroTitle: string;
  tabsIntroDescription: string;
  /** Local motif image used when a use-case feature has no imageUrl. Never a remote URL. */
  tabImageFallback: string;
  recommendedTag: string;
  recommendedTitle: string;
  recommendedDescription: string;
  faqTag: string;
  faqTitle: string;
  ctaEyebrow: string;
  ctaHeadline: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

export const SOLUTION_PAGE_DEFAULTS: SolutionPageDefaults = {
  heroEyebrow: "Solution",
  heroCaptionTemplate: "Unified workflows for {title}",
  heroPrimaryCtaLabel: "Request a Demo",
  heroPrimaryCtaHref: "/demo",
  heroSecondaryCtaLabel: "Contact Us",
  heroSecondaryCtaHref: "/contact",
  tabsIntroTag: "Capabilities",
  tabsIntroTitle: "Explore the solution",
  tabsIntroDescription:
    "Select a capability to see how it fits your team's workflow.",
  tabImageFallback: "/assets/images/attendance.png",
  recommendedTag: "Recommended",
  recommendedTitle: "Platform For You",
  recommendedDescription: "These modules are tailored for your team's needs.",
  faqTag: "Got Questions?",
  faqTitle: "Frequently Asked Questions",
  // Bottom CTASection: preserve the component's own module-level defaults.
  ctaEyebrow: "Build with us",
  ctaHeadline: "Ready to Transform Your Operations?",
  ctaDescription:
    "Request a walkthrough tailored to this solution — or get in touch.",
  ctaPrimaryLabel: "Book a Demo",
  ctaPrimaryHref: "/demo",
  ctaSecondaryLabel: "Contact Us",
  ctaSecondaryHref: "/contact",
};

/** Replace the `{title}` token in a template string. */
export function applySolutionTitleTemplate(
  template: string,
  title: string,
): string {
  return template.replace(/\{title\}/g, title);
}
