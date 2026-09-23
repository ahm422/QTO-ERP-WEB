import type { HomeFinalCta } from "@/types/content";

/** site_settings key for the about page final CTA singleton (JSON value). */
export const ABOUT_FINAL_CTA_KEY = "about_final_cta" as const;

export type { HomeFinalCta as AboutFinalCta };

export const ABOUT_FINAL_CTA_DEFAULTS: HomeFinalCta = {
  tag: "Join the team",
  title: "Ready to Transform Your Operations?",
  description:
    "We're building the modern ERP growing teams love — let's talk.",
  primaryCta: { label: "Book a Demo", url: "/demo" },
  secondaryCta: { label: "Contact Us", url: "/contact" },
};
