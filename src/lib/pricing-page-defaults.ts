export const PRICING_PAGE_CONTENT_ID = "default" as const;

export type PricingPageContentDefault = {
  id: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  faqTag: string;
  faqTitle: string;
};

export const PRICING_PAGE_CONTENT_DEFAULTS: PricingPageContentDefault = {
  id: PRICING_PAGE_CONTENT_ID,
  heroBadge: "Pricing",
  heroTitle: "Simple, Transparent Pricing",
  heroSubtitle: "Start free. Scale as you grow. No hidden fees.",
  faqTag: "FAQ",
  faqTitle: "Pricing Questions",
};
