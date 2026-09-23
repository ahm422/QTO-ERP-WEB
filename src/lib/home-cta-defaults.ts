import type { HomeFinalCta } from "@/types/content";

/** site_settings key for the home page final CTA singleton (JSON value). */
export const HOME_FINAL_CTA_KEY = "home_final_cta" as const;

export type { HomeFinalCta };

export const HOME_FINAL_CTA_DEFAULTS: HomeFinalCta = {
  tag: "Next step",
  title: "Ready to Transform Your Operations?",
  description:
    "See how QTO-ERP fits your workflows — book a demo or get in touch.",
  primaryCta: { label: "Book a Demo", url: "/demo" },
  secondaryCta: { label: "Contact Us", url: "/contact" },
};
