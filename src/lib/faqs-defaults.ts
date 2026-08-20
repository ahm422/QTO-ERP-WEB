import type { HomeSectionDefault } from "@/lib/home-sections-defaults";
import { FAQ_SECTION_KEY } from "@/lib/home-sections-defaults";

/**
 * Defaults for Pattern A shared page FAQs (faqs table).
 * Pattern B (erp_modules.faqs / solutions.solution_faqs JSON) is intentionally separate.
 */

export const FAQ_PAGE_KEY_HOME = "home" as const;
export const FAQ_PAGE_KEY_PRICING = "pricing" as const;
export const FAQ_PAGE_KEY_CONTACT = "contact" as const;

export type FaqDefault = {
  pageKey: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  published: boolean;
};

/** Seeded as home_sections row sectionKey = "faq". */
export const FAQ_SECTION_DEFAULT: HomeSectionDefault = {
  sectionKey: FAQ_SECTION_KEY,
  tag: "FAQ",
  title: "Common",
  accent: "Questions",
  description: "",
};

/** Current generalFaqs from testimonials — all 10 published for pageKey=home. */
export const HOME_FAQS_DEFAULTS: FaqDefault[] = [
  {
    pageKey: FAQ_PAGE_KEY_HOME,
    question: "What is this platform?",
    answer:
      "A modern ERP suite for managing attendance, HR, and projects — designed for growing businesses.",
    category: "General",
    sortOrder: 0,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_HOME,
    question: "Is it cloud-based?",
    answer:
      "Yes. Fully cloud-based with 99.9% uptime SLA. Access from any device, anywhere.",
    category: "General",
    sortOrder: 1,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_HOME,
    question: "How long does setup take?",
    answer:
      "Most teams are up and running within a day. Enterprise setups with data migration typically take 1-2 weeks.",
    category: "Getting Started",
    sortOrder: 2,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_HOME,
    question: "Do you offer training?",
    answer:
      "Yes. All plans include access to our knowledge base and video tutorials. Growth and Enterprise plans include live training sessions.",
    category: "Getting Started",
    sortOrder: 3,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_HOME,
    question: "Is my data secure?",
    answer:
      "Absolutely. We use enterprise-grade encryption, regular security audits, and comply with SOC 2 and GDPR.",
    category: "Security",
    sortOrder: 4,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_HOME,
    question: "Can I export my data?",
    answer:
      "Yes. Export any data in CSV, Excel, or via our API at any time. Your data is always yours.",
    category: "Security",
    sortOrder: 5,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_HOME,
    question: "What integrations are available?",
    answer:
      "We integrate with popular payroll, accounting, and communication tools. Enterprise plans get custom integration support.",
    category: "Integrations",
    sortOrder: 6,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_HOME,
    question: "Do you have an API?",
    answer:
      "Yes. Our REST API is available on Growth and Enterprise plans with comprehensive documentation.",
    category: "Integrations",
    sortOrder: 7,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_HOME,
    question: "What support do you offer?",
    answer:
      "Email support for Starter, priority support for Growth, and dedicated 24/7 support for Enterprise.",
    category: "Support",
    sortOrder: 8,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_HOME,
    question: "Can I cancel my subscription?",
    answer:
      "Yes, cancel anytime with no penalties. You retain access until the end of your billing period.",
    category: "Billing",
    sortOrder: 9,
    published: true,
  },
];

/** Pricing page FAQs — source of truth for seed + runtime fallbacks. */
export const PRICING_FAQS_DEFAULTS: FaqDefault[] = [
  {
    pageKey: FAQ_PAGE_KEY_PRICING,
    question: "Is there a free trial?",
    answer:
      "Yes. Starter and Growth include a 14-day free trial. Stripe collects a card on file; you will not be charged until the trial ends. Enterprise is custom — contact sales.",
    category: null,
    sortOrder: 0,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_PRICING,
    question: "Can I switch plans later?",
    answer:
      "Absolutely. Upgrade or downgrade anytime. Changes take effect on your next billing cycle.",
    category: null,
    sortOrder: 1,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_PRICING,
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, bank transfers, and can invoice for Enterprise plans.",
    category: null,
    sortOrder: 2,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_PRICING,
    question: "Is there a setup fee?",
    answer:
      "No setup fees for Starter and Growth plans. Enterprise includes complimentary onboarding.",
    category: null,
    sortOrder: 3,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_PRICING,
    question: "Can I cancel anytime?",
    answer:
      "Yes. Cancel anytime with no penalties. You'll retain access until the end of your billing period.",
    category: null,
    sortOrder: 4,
    published: true,
  },
];

/** Contact page FAQs — source of truth for seed + runtime fallbacks. */
export const CONTACT_FAQS_DEFAULTS: FaqDefault[] = [
  {
    pageKey: FAQ_PAGE_KEY_CONTACT,
    question: "What are your business hours?",
    answer: "Monday - Friday, 9AM - 6PM EST",
    category: null,
    sortOrder: 0,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_CONTACT,
    question: "How long does implementation take?",
    answer: "Typically 2-8 weeks depending on complexity",
    category: null,
    sortOrder: 1,
    published: true,
  },
  {
    pageKey: FAQ_PAGE_KEY_CONTACT,
    question: "Do you offer training?",
    answer: "Yes, comprehensive training included with all plans",
    category: null,
    sortOrder: 2,
    published: true,
  },
];
