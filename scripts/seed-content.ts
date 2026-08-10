import { apps } from "../src/lib/apps";
import { solutions } from "../src/lib/solutions";
import { comparisonFeatures } from "../src/lib/pricing";
import { stripePriceIdsFromEnv } from "../src/lib/stripe-prices";
import { SITE_SETTING_DEFAULTS } from "../src/lib/site-settings";
import { QTO_DEV_URL } from "../src/lib/constants";
import {
  blogPosts,
  builtForCards,
  comparisonFeatures as comparisonFeaturesTable,
  demoPageContent,
  erpModules,
  faqs,
  footerContent,
  homeHero,
  homeSections,
  homeStats,
  industryDomains,
  navResources,
  pricingPageContent,
  pricingPlans,
  siteSettings,
  solutions as solutionsTable,
  trustedLogos,
} from "../src/db/schema";
import { HOME_HERO_DEFAULTS, HOME_HERO_ID, ORBIT_SEED_BY_SLUG } from "../src/lib/home-hero-defaults";
import {
  BUILT_FOR_CARDS_DEFAULTS,
  BUILT_FOR_SECTION_DEFAULT,
  ECOSYSTEM_SECTION_DEFAULT,
  HOME_STATS_DEFAULTS,
  TRUSTED_LOGOS_DEFAULTS,
} from "../src/lib/home-sections-defaults";
import {
  FAQ_PAGE_KEY_HOME,
  FAQ_PAGE_KEY_PRICING,
  FAQ_SECTION_DEFAULT,
  HOME_FAQS_DEFAULTS,
  PRICING_FAQS_DEFAULTS,
} from "../src/lib/faqs-defaults";
import {
  HOME_FINAL_CTA_DEFAULTS,
  HOME_FINAL_CTA_KEY,
} from "../src/lib/home-cta-defaults";
import { FOOTER_CONTENT_DEFAULTS } from "../src/lib/footer-defaults";
import { DEMO_PAGE_CONTENT_DEFAULTS } from "../src/lib/demo-page-defaults";
import { PRICING_PAGE_CONTENT_DEFAULTS } from "../src/lib/pricing-page-defaults";
import { INDUSTRY_DOMAINS_DEFAULTS } from "../src/lib/industry-domains-defaults";
import type { PlatformType } from "../src/types/appModule";
import type { ScriptDb } from "./db";
import { seedTrustedLogoObjectsToR2 } from "./seed-trusted-logos-r2";
import { and, count, eq, isNull, notInArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const PRICING_PLANS_SEED = [
  {
    slug: "starter",
    name: "Starter",
    description:
      "For small teams getting started with workforce management.",
    monthlyPriceDisplay: 29,
    yearlyPriceDisplay: 24,
    popular: false,
    features: [
      "Up to 25 employees",
      "Attendance & Time tracking",
      "Basic leave management",
      "Email support",
      "Mobile app access",
      "Standard reports",
    ],
    cta: "Start Free Trial",
    sortOrder: 0,
  },
  {
    slug: "growth",
    name: "Growth",
    description: "For growing teams that need HRM and project tools.",
    monthlyPriceDisplay: 79,
    yearlyPriceDisplay: 66,
    popular: true,
    features: [
      "Up to 200 employees",
      "All Starter features",
      "Full HRM module",
      "Project Management",
      "Performance reviews",
      "Priority support",
      "Custom fields & workflows",
      "API access",
    ],
    cta: "Start Free Trial",
    sortOrder: 1,
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    description: "For large organizations with advanced needs.",
    monthlyPriceDisplay: 149,
    yearlyPriceDisplay: 124,
    popular: false,
    features: [
      "Unlimited employees",
      "All Growth features",
      "Custom integrations",
      "Dedicated account manager",
      "SLA & uptime guarantee",
      "SSO & advanced security",
      "On-premise option",
      "Custom training",
      "Multi-entity support",
    ],
    cta: "Contact Sales",
    sortOrder: 2,
  },
] as const;

function stripePriceIdsForSlug(slug: string) {
  if (slug === "enterprise") {
    return { stripePriceIdMonthly: null, stripePriceIdYearly: null };
  }

  const { monthly, yearly } = stripePriceIdsFromEnv(slug);

  if (!monthly || !yearly) {
    console.warn(
      `[seed] Missing Stripe price IDs for "${slug}" — set STRIPE_PRICE_* env vars for checkout.`,
    );
  }

  return {
    stripePriceIdMonthly: monthly,
    stripePriceIdYearly: yearly,
  };
}

const SLUG_ICON_KEYS: Record<string, string> = {
  attendance: "clock",
  hrm: "users",
  "project-management": "folder-kanban",
  crms: "building-2",
  salary: "dollar-sign",
  finance: "trending-up",
};

function moduleToDbData(app: PlatformType, sortOrder: number) {
  const { icon: _icon, ...rest } = app as PlatformType & { icon: unknown };
  const iconKey = SLUG_ICON_KEYS[rest.slug] ?? "clock";

  return {
    slug: rest.slug,
    name: rest.name,
    shortDescription: rest.shortDescription,
    image: rest.image ?? null,
    highlights: rest.highlights,
    bestFor: rest.bestFor,
    cardTagline: rest.cardTagline ?? null,
    iconKey,
    videoUrl: rest.videoUrl,
    videoCtaTitle: rest.videoCtaTitle ?? null,
    videoCtaDescription: rest.videoCtaDescription ?? null,
    heroHeadline: rest.heroHeadline,
    heroSubheadline: rest.heroSubheadline,
    heroCtaLabel: rest.heroCtaLabel ?? null,
    aboutTitle: rest.aboutTitle,
    aboutTag: rest.aboutTag ?? null,
    aboutDescription: rest.aboutDescription,
    aboutContents: rest.aboutContents ?? null,
    featuresSectionTitle: rest.featuresSectionTitle ?? null,
    features: rest.features,
    problems: rest.problems,
    testimonialsSectionTag: rest.testimonialsSectionTag ?? null,
    testimonialsSectionTitle: rest.testimonialsSectionTitle ?? null,
    testimonialsSectionDescription: rest.testimonialsSectionDescription ?? null,
    useCases: rest.useCases,
    testimonials: rest.testimonials,
    faqs: rest.faqs,
    sortOrder,
    published: true,
  };
}

const BLOG_POSTS = [
  {
    slug: "streamline-hr-2026",
    title: "How to Streamline Your HR Processes in 2026",
    category: "HR",
    excerpt:
      "Practical steps to automate onboarding, leave, and performance workflows so your HR team can focus on people, not paperwork.",
    content: `<p>Modern HR teams are under pressure to do more with less. The right ERP brings employee data, attendance, leave, and reviews into one place—cutting duplicate entry and giving managers real-time visibility.</p><p>Start by mapping your highest-volume workflows: onboarding, leave requests, and timesheet approvals. Automate notifications and approval chains so nothing sits in email inboxes. Measure time saved per month and use that data to justify the next phase of rollout.</p>`,
    publishedAt: new Date("2026-01-15T00:00:00.000Z"),
  },
  {
    slug: "project-management-mistakes",
    title: "5 Project Management Mistakes That Kill Deadlines",
    category: "Project Management",
    excerpt:
      "Unclear ownership, missing milestones, and scattered tools are among the top reasons projects slip—here is how to fix them.",
    content: `<p>Deadlines slip when teams lack a single source of truth for tasks, owners, and dependencies. Spreadsheets and chat threads multiply confusion.</p><p>Consolidate planning in one system, define owners for every milestone, and review blockers weekly. Integrate time tracking and resource allocation so capacity matches commitments.</p>`,
    publishedAt: new Date("2026-02-01T00:00:00.000Z"),
  },
  {
    slug: "future-of-attendance-tracking",
    title: "The Future of Attendance Tracking",
    category: "Attendance",
    excerpt:
      "From mobile clock-ins to policy-aware overtime, see how attendance technology is evolving for hybrid and field teams.",
    content: `<p>Attendance is no longer just punch clocks. Teams expect mobile check-in, geo-fencing for field sites, and automatic overtime rules tied to payroll.</p><p>Look for systems that audit every adjustment, sync with leave balances, and export clean data for payroll without manual reconciliation.</p>`,
    publishedAt: new Date("2026-02-20T00:00:00.000Z"),
  },
  {
    slug: "why-growing-teams-need-erp",
    title: "Why Growing Teams Need an ERP",
    category: "Business",
    excerpt:
      "As headcount grows, disconnected tools create risk and drag—an integrated ERP becomes the backbone for scale.",
    content: `<p>Startups often outgrow spreadsheets quickly. Finance, HR, and operations each pick their own tools until reporting becomes a monthly fire drill.</p><p>An ERP unifies core workflows so leadership sees one picture: who is working, what projects are running, and where money goes. That clarity supports faster hiring, better compliance, and confident planning.</p>`,
    publishedAt: new Date("2026-03-10T00:00:00.000Z"),
  },
];

export async function seedContent(db: ScriptDb, authorId: string) {
  for (let i = 0; i < apps.length; i++) {
    const data = moduleToDbData(apps[i], i);
    await db
      .insert(erpModules)
      .values(data)
      .onConflictDoUpdate({
        target: erpModules.slug,
        set: data,
      });
  }
  console.log(`Seeded ${apps.length} ERP modules`);

  // Apply orbit layout defaults only when null (preserve admin orbit tweaks on re-seed).
  for (const [slug, orbit] of Object.entries(ORBIT_SEED_BY_SLUG)) {
    const [orbitRadius, orbitTilt, orbitPhase, orbitSpeed] = orbit;
    await db
      .update(erpModules)
      .set({ orbitRadius, orbitTilt, orbitPhase, orbitSpeed })
      .where(and(eq(erpModules.slug, slug), isNull(erpModules.orbitRadius)));
  }
  console.log("Seeded orbit layout defaults for known module slugs");

  for (let i = 0; i < solutions.length; i++) {
    const s = solutions[i];
    const data = {
      slug: s.slug,
      title: s.title,
      audience: s.audience,
      heroHeadline: s.heroHeadline,
      heroSubheadline: s.heroSubheadline,
      problems: s.problems,
      recommendedModules: s.recommendedModules,
      testimonial: s.testimonial,
      solutionFaqs: s.solutionFaqs,
      useCases: s.useCases ?? null,
      sortOrder: i,
      published: true,
    };
    await db
      .insert(solutionsTable)
      .values(data)
      .onConflictDoUpdate({
        target: solutionsTable.slug,
        set: data,
      });
  }
  console.log(`Seeded ${solutions.length} solutions`);

  for (let i = 0; i < comparisonFeatures.length; i++) {
    const row = comparisonFeatures[i];
    const data = {
      feature: row.feature,
      starter: row.starter,
      growth: row.growth,
      enterprise: row.enterprise,
      sortOrder: i,
      published: true,
    };
    await db
      .insert(comparisonFeaturesTable)
      .values(data)
      .onConflictDoUpdate({
        target: comparisonFeaturesTable.feature,
        set: data,
      });
  }
  console.log(`Seeded ${comparisonFeatures.length} comparison features`);

  for (const plan of PRICING_PLANS_SEED) {
    const priceIds = stripePriceIdsForSlug(plan.slug);
    const data = {
      slug: plan.slug,
      name: plan.name,
      description: plan.description,
      monthlyPriceDisplay: plan.monthlyPriceDisplay,
      yearlyPriceDisplay: plan.yearlyPriceDisplay,
      popular: plan.popular,
      features: [...plan.features],
      cta: plan.cta,
      sortOrder: plan.sortOrder,
      published: true,
      ...priceIds,
    };
    await db
      .insert(pricingPlans)
      .values(data)
      .onConflictDoUpdate({
        target: pricingPlans.slug,
        set: data,
      });
  }
  console.log(`Seeded ${PRICING_PLANS_SEED.length} pricing plans`);

  for (const post of BLOG_POSTS) {
    const data = {
      slug: post.slug,
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      status: "PUBLISHED" as const,
      publishedAt: post.publishedAt,
      authorId,
    };
    await db
      .insert(blogPosts)
      .values(data)
      .onConflictDoUpdate({
        target: blogPosts.slug,
        set: data,
      });
  }
  console.log(`Seeded ${BLOG_POSTS.length} blog posts`);

  for (const [key, value] of Object.entries(SITE_SETTING_DEFAULTS)) {
    await db
      .insert(siteSettings)
      .values({ key, value })
      .onConflictDoNothing();
  }
  console.log("Seeded site settings defaults");

  await db
    .insert(homeHero)
    .values({
      id: HOME_HERO_ID,
      eyebrowText: HOME_HERO_DEFAULTS.eyebrowText,
      titleLine1: HOME_HERO_DEFAULTS.titleLine1,
      titleAccent: HOME_HERO_DEFAULTS.titleAccent,
      subtitle: HOME_HERO_DEFAULTS.subtitle,
      bullets: HOME_HERO_DEFAULTS.bullets,
      primaryCtaLabel: HOME_HERO_DEFAULTS.primaryCtaLabel,
      primaryCtaUrl: HOME_HERO_DEFAULTS.primaryCtaUrl,
      secondaryCtaLabel: HOME_HERO_DEFAULTS.secondaryCtaLabel,
      secondaryCtaUrl: HOME_HERO_DEFAULTS.secondaryCtaUrl,
      poweredByText: HOME_HERO_DEFAULTS.poweredByText,
      poweredByUrl: HOME_HERO_DEFAULTS.poweredByUrl,
    })
    .onConflictDoNothing();
  console.log("Seeded home hero defaults");

  await db.delete(navResources);
  await db.insert(navResources).values([
    {
      label: "Blog",
      href: "/blog",
      iconKey: "newspaper",
      subtitle: "Latest articles & insights",
      sortOrder: 0,
    },
    {
      label: "About Us",
      href: "/about",
      iconKey: "info",
      subtitle: "Who we are",
      sortOrder: 1,
    },
    {
      label: "Contact Us",
      href: "/contact",
      iconKey: "mail",
      subtitle: "Get in touch",
      sortOrder: 2,
    },
    {
      label: "QTO Dev",
      href: QTO_DEV_URL,
      iconKey: "code",
      subtitle: "Web development partner",
      sortOrder: 3,
      external: true,
    },
  ]);
  console.log("Seeded nav resources");

  const [{ logosCount }] = await db
    .select({ logosCount: count() })
    .from(trustedLogos);
  if ((logosCount ?? 0) === 0) {
    await db.insert(trustedLogos).values(
      TRUSTED_LOGOS_DEFAULTS.map((logo) => ({
        id: createId(),
        name: logo.name,
        logoImageKey: logo.logoImageKey,
        linkUrl: logo.linkUrl,
        sortOrder: logo.sortOrder,
        published: logo.published,
      })),
    );
    console.log(`Seeded ${TRUSTED_LOGOS_DEFAULTS.length} trusted logos`);
  } else {
    const keepNames = TRUSTED_LOGOS_DEFAULTS.map((l) => l.name);
    await db
      .delete(trustedLogos)
      .where(notInArray(trustedLogos.name, keepNames));
    for (const logo of TRUSTED_LOGOS_DEFAULTS) {
      await db
        .update(trustedLogos)
        .set({
          logoImageKey: logo.logoImageKey,
          linkUrl: logo.linkUrl,
          sortOrder: logo.sortOrder,
          published: logo.published,
        })
        .where(eq(trustedLogos.name, logo.name));
    }
    console.log(
      "Trusted logos pruned/synced to QTO House / QTO Solutions (extras removed if any)",
    );
  }

  try {
    seedTrustedLogoObjectsToR2({ remote: false });
  } catch (err) {
    console.warn(
      "Trusted logo R2 upload skipped:",
      err instanceof Error ? err.message : err,
    );
  }

  const [{ statsCount }] = await db
    .select({ statsCount: count() })
    .from(homeStats);
  if ((statsCount ?? 0) === 0) {
    await db.insert(homeStats).values(
      HOME_STATS_DEFAULTS.map((stat) => ({
        id: createId(),
        label: stat.label,
        value: stat.value,
        suffix: stat.suffix,
        iconKey: stat.iconKey,
        sortOrder: stat.sortOrder,
        published: stat.published,
      })),
    );
    console.log(`Seeded ${HOME_STATS_DEFAULTS.length} home stats`);
  } else {
    console.log("Home stats already present — skip insert");
  }

  await db
    .insert(homeSections)
    .values({
      sectionKey: BUILT_FOR_SECTION_DEFAULT.sectionKey,
      tag: BUILT_FOR_SECTION_DEFAULT.tag,
      title: BUILT_FOR_SECTION_DEFAULT.title,
      accent: BUILT_FOR_SECTION_DEFAULT.accent,
      description: BUILT_FOR_SECTION_DEFAULT.description,
    })
    .onConflictDoNothing();
  console.log("Seeded built_for home section header");

  const [{ cardsCount }] = await db
    .select({ cardsCount: count() })
    .from(builtForCards);
  if ((cardsCount ?? 0) === 0) {
    await db.insert(builtForCards).values(
      BUILT_FOR_CARDS_DEFAULTS.map((card) => ({
        id: createId(),
        title: card.title,
        description: card.description,
        iconKey: card.iconKey,
        sortOrder: card.sortOrder,
        published: card.published,
      })),
    );
    console.log(`Seeded ${BUILT_FOR_CARDS_DEFAULTS.length} built-for cards`);
  } else {
    console.log("Built-for cards already present — skip insert");
  }

  await db
    .insert(homeSections)
    .values({
      sectionKey: ECOSYSTEM_SECTION_DEFAULT.sectionKey,
      tag: ECOSYSTEM_SECTION_DEFAULT.tag,
      title: ECOSYSTEM_SECTION_DEFAULT.title,
      accent: ECOSYSTEM_SECTION_DEFAULT.accent,
      description: ECOSYSTEM_SECTION_DEFAULT.description,
    })
    .onConflictDoNothing();
  console.log("Seeded ecosystem home section header");

  const [{ domainsCount }] = await db
    .select({ domainsCount: count() })
    .from(industryDomains);
  if ((domainsCount ?? 0) === 0) {
    for (const domain of INDUSTRY_DOMAINS_DEFAULTS) {
      await db.insert(industryDomains).values({
        id: createId(),
        slug: domain.slug,
        name: domain.name,
        orderIndex: domain.orderIndex,
        systemsCount: domain.systemsCount,
        iconKey: domain.iconKey,
        description: domain.description,
        leaders: JSON.stringify(domain.leaders),
        ctaLabel: domain.ctaLabel,
        ctaUrl: domain.ctaUrl,
        sortOrder: domain.sortOrder,
        published: domain.published,
      });
    }
    console.log(
      `Seeded ${INDUSTRY_DOMAINS_DEFAULTS.length} industry domains`,
    );
  } else {
    console.log("Industry domains already present — skip insert");
  }

  await db
    .insert(homeSections)
    .values({
      sectionKey: FAQ_SECTION_DEFAULT.sectionKey,
      tag: FAQ_SECTION_DEFAULT.tag,
      title: FAQ_SECTION_DEFAULT.title,
      accent: FAQ_SECTION_DEFAULT.accent,
      description: FAQ_SECTION_DEFAULT.description,
    })
    .onConflictDoNothing();
  console.log("Seeded faq home section header");

  const [{ faqsCount }] = await db
    .select({ faqsCount: count() })
    .from(faqs)
    .where(eq(faqs.pageKey, FAQ_PAGE_KEY_HOME));
  if ((faqsCount ?? 0) === 0) {
    await db.insert(faqs).values(
      HOME_FAQS_DEFAULTS.map((faq) => ({
        id: createId(),
        pageKey: faq.pageKey,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        sortOrder: faq.sortOrder,
        published: faq.published,
      })),
    );
    console.log(`Seeded ${HOME_FAQS_DEFAULTS.length} home FAQs`);
  } else {
    console.log("Home FAQs already present — skip insert");
  }

  await db
    .insert(siteSettings)
    .values({
      key: HOME_FINAL_CTA_KEY,
      value: JSON.stringify(HOME_FINAL_CTA_DEFAULTS),
    })
    .onConflictDoNothing();
  console.log("Seeded home_final_cta site setting");

  await db
    .insert(footerContent)
    .values({
      id: FOOTER_CONTENT_DEFAULTS.id,
      brandBlurb: FOOTER_CONTENT_DEFAULTS.brandBlurb,
      builtByLabel: FOOTER_CONTENT_DEFAULTS.builtByLabel,
      builtByUrl: FOOTER_CONTENT_DEFAULTS.builtByUrl,
      newsletterHeading: FOOTER_CONTENT_DEFAULTS.newsletterHeading,
      newsletterCopy: FOOTER_CONTENT_DEFAULTS.newsletterCopy,
      linkGroups: FOOTER_CONTENT_DEFAULTS.linkGroups,
      copyrightText: FOOTER_CONTENT_DEFAULTS.copyrightText,
      bottomLinks: FOOTER_CONTENT_DEFAULTS.bottomLinks,
    })
    .onConflictDoNothing();
  console.log("Seeded footer content");

  await db
    .insert(demoPageContent)
    .values({
      id: DEMO_PAGE_CONTENT_DEFAULTS.id,
      heroBadge: DEMO_PAGE_CONTENT_DEFAULTS.heroBadge,
      heroTitle: DEMO_PAGE_CONTENT_DEFAULTS.heroTitle,
      heroAccent: DEMO_PAGE_CONTENT_DEFAULTS.heroAccent,
      heroDescription: DEMO_PAGE_CONTENT_DEFAULTS.heroDescription,
      heroBadges: DEMO_PAGE_CONTENT_DEFAULTS.heroBadges,
      processTag: DEMO_PAGE_CONTENT_DEFAULTS.processTag,
      processTitle: DEMO_PAGE_CONTENT_DEFAULTS.processTitle,
      processDescription: DEMO_PAGE_CONTENT_DEFAULTS.processDescription,
      whatToExpect: DEMO_PAGE_CONTENT_DEFAULTS.whatToExpect,
      sideTitle: DEMO_PAGE_CONTENT_DEFAULTS.sideTitle,
      sideDescription: DEMO_PAGE_CONTENT_DEFAULTS.sideDescription,
      benefits: DEMO_PAGE_CONTENT_DEFAULTS.benefits,
      testimonialQuote: DEMO_PAGE_CONTENT_DEFAULTS.testimonialQuote,
      testimonialAuthor: DEMO_PAGE_CONTENT_DEFAULTS.testimonialAuthor,
      testimonialRole: DEMO_PAGE_CONTENT_DEFAULTS.testimonialRole,
      formFieldOptions: DEMO_PAGE_CONTENT_DEFAULTS.formFieldOptions,
    })
    .onConflictDoNothing();
  console.log("Seeded demo page content");

  await db
    .insert(pricingPageContent)
    .values({
      id: PRICING_PAGE_CONTENT_DEFAULTS.id,
      heroBadge: PRICING_PAGE_CONTENT_DEFAULTS.heroBadge,
      heroTitle: PRICING_PAGE_CONTENT_DEFAULTS.heroTitle,
      heroSubtitle: PRICING_PAGE_CONTENT_DEFAULTS.heroSubtitle,
      faqTag: PRICING_PAGE_CONTENT_DEFAULTS.faqTag,
      faqTitle: PRICING_PAGE_CONTENT_DEFAULTS.faqTitle,
    })
    .onConflictDoNothing();
  console.log("Seeded pricing page content");

  const [{ pricingFaqsCount }] = await db
    .select({ pricingFaqsCount: count() })
    .from(faqs)
    .where(eq(faqs.pageKey, FAQ_PAGE_KEY_PRICING));
  if ((pricingFaqsCount ?? 0) === 0) {
    await db.insert(faqs).values(
      PRICING_FAQS_DEFAULTS.map((faq) => ({
        id: createId(),
        pageKey: faq.pageKey,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        sortOrder: faq.sortOrder,
        published: faq.published,
      })),
    );
    console.log(`Seeded ${PRICING_FAQS_DEFAULTS.length} pricing FAQs`);
  } else {
    console.log("Pricing FAQs already present — skip insert");
  }
}
