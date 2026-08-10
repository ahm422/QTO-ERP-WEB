import type { InferSelectModel } from "drizzle-orm";
import {
  blogPosts,
  builtForCards,
  comparisonFeatures,
  erpModules,
  homeHero,
  homeSections,
  homeStats,
  industryDomains,
  pricingPlans,
  solutions,
  trustedLogos,
} from "@/db/schema";
import type {
  ModuleDetail,
  ModuleSummary,
  SolutionDetail,
  SolutionSummary,
  BlogPostDetail,
  BlogPostSummary,
  ComparisonRow,
  HomeHero,
  HeroOrbitModule,
  TrustedLogo,
  HomeStat,
  HomeSectionHeader,
  BuiltForCard,
  IndustryDomainSummary,
} from "@/types/content";
import type { PricingPlan as PricingPlanPublic } from "@/types/pricingPlan";
import { mediaUrl } from "@/lib/media";

type ErpModule = InferSelectModel<typeof erpModules>;
type Solution = InferSelectModel<typeof solutions>;
type BlogPost = InferSelectModel<typeof blogPosts>;
type ComparisonFeature = InferSelectModel<typeof comparisonFeatures>;
type PricingPlan = InferSelectModel<typeof pricingPlans>;
type HomeHeroRow = InferSelectModel<typeof homeHero>;
type TrustedLogoRow = InferSelectModel<typeof trustedLogos>;
type HomeStatRow = InferSelectModel<typeof homeStats>;
type BuiltForCardRow = InferSelectModel<typeof builtForCards>;
type HomeSectionRow = InferSelectModel<typeof homeSections>;
type IndustryDomainRow = InferSelectModel<typeof industryDomains>;

export function serializeModuleSummary(m: ErpModule): ModuleSummary {
  return {
    slug: m.slug,
    name: m.name,
    shortDescription: m.shortDescription,
    image: m.image ?? undefined,
    iconKey: m.iconKey,
    cardTagline: m.cardTagline ?? undefined,
    highlights: m.highlights,
    bestFor: m.bestFor,
  };
}

export function serializeModuleDetail(m: ErpModule): ModuleDetail {
  return {
    ...serializeModuleSummary(m),
    videoUrl: m.videoUrl,
    videoCtaTitle: m.videoCtaTitle ?? undefined,
    videoCtaDescription: m.videoCtaDescription ?? undefined,
    heroHeadline: m.heroHeadline,
    heroSubheadline: m.heroSubheadline,
    heroCtaLabel: m.heroCtaLabel ?? undefined,
    aboutTitle: m.aboutTitle,
    aboutTag: m.aboutTag ?? undefined,
    aboutDescription: m.aboutDescription,
    aboutContents: m.aboutContents ?? undefined,
    featuresSectionTitle: m.featuresSectionTitle ?? undefined,
    features: m.features,
    problems: m.problems,
    testimonialsSectionTag: m.testimonialsSectionTag ?? undefined,
    testimonialsSectionTitle: m.testimonialsSectionTitle ?? undefined,
    testimonialsSectionDescription:
      m.testimonialsSectionDescription ?? undefined,
    useCases: m.useCases,
    testimonials: m.testimonials,
    faqs: m.faqs,
  };
}

export function serializeHomeHero(row: HomeHeroRow): HomeHero {
  return {
    eyebrowText: row.eyebrowText,
    titleLine1: row.titleLine1,
    titleAccent: row.titleAccent,
    subtitle: row.subtitle,
    bullets: row.bullets,
    primaryCtaLabel: row.primaryCtaLabel,
    primaryCtaUrl: row.primaryCtaUrl,
    secondaryCtaLabel: row.secondaryCtaLabel,
    secondaryCtaUrl: row.secondaryCtaUrl,
    poweredByText: row.poweredByText,
    poweredByUrl: row.poweredByUrl,
  };
}

export function serializeHeroOrbitModule(m: ErpModule): HeroOrbitModule {
  return {
    id: m.id,
    slug: m.slug,
    name: m.name,
    shortDescription: m.shortDescription,
    cardTagline: m.cardTagline ?? undefined,
    iconKey: m.iconKey,
    sortOrder: m.sortOrder,
    published: m.published,
    showInHeroOrbit: m.showInHeroOrbit,
    orbitRadius: m.orbitRadius ?? null,
    orbitTilt: m.orbitTilt ?? null,
    orbitPhase: m.orbitPhase ?? null,
    orbitSpeed: m.orbitSpeed ?? null,
  };
}

export function serializeSolutionSummary(s: Solution): SolutionSummary {
  return {
    slug: s.slug,
    title: s.title,
    audience: s.audience,
    heroHeadline: s.heroHeadline,
    heroSubheadline: s.heroSubheadline,
  };
}

export function serializeSolutionDetail(s: Solution): SolutionDetail {
  return {
    ...serializeSolutionSummary(s),
    problems: s.problems,
    recommendedModules: s.recommendedModules,
    testimonial: s.testimonial,
    solutionFaqs: s.solutionFaqs,
    useCases: s.useCases ?? undefined,
  };
}

export function serializeBlogSummary(p: BlogPost): BlogPostSummary {
  return {
    slug: p.slug,
    title: p.title,
    category: p.category,
    excerpt: p.excerpt ?? undefined,
    publishedAt: p.publishedAt!.toISOString(),
  };
}

export function serializeBlogDetail(p: BlogPost): BlogPostDetail {
  return {
    ...serializeBlogSummary(p),
    content: p.content,
  };
}

export function serializeComparisonRow(r: ComparisonFeature): ComparisonRow {
  return {
    feature: r.feature,
    starter: r.starter,
    growth: r.growth,
    enterprise: r.enterprise,
  };
}

export function serializePricingPlan(p: PricingPlan): PricingPlanPublic {
  return {
    slug: p.slug,
    name: p.name,
    monthlyPrice: p.monthlyPriceDisplay,
    yearlyPrice: p.yearlyPriceDisplay,
    description: p.description,
    popular: p.popular,
    features: p.features,
    cta: p.cta,
  };
}

export function serializeTrustedLogo(row: TrustedLogoRow): TrustedLogo {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.logoImageKey ? mediaUrl(row.logoImageKey) : null,
    linkUrl: row.linkUrl ?? null,
    sortOrder: row.sortOrder,
  };
}

export function serializeHomeStat(row: HomeStatRow): HomeStat {
  return {
    id: row.id,
    label: row.label,
    value: row.value,
    suffix: row.suffix,
    iconKey: row.iconKey,
    sortOrder: row.sortOrder,
  };
}

export function serializeHomeSection(row: HomeSectionRow): HomeSectionHeader {
  return {
    tag: row.tag,
    title: row.title,
    accent: row.accent,
    description: row.description,
  };
}

export function serializeBuiltForCard(row: BuiltForCardRow): BuiltForCard {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    iconKey: row.iconKey,
    sortOrder: row.sortOrder,
  };
}

function parseLeadersJson(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

export function serializeIndustryDomain(
  row: IndustryDomainRow,
): IndustryDomainSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    orderIndex: row.orderIndex,
    systemsCount: row.systemsCount,
    iconKey: row.iconKey,
    description: row.description,
    leaders: parseLeadersJson(row.leaders),
    ctaLabel: row.ctaLabel ?? null,
    ctaUrl: row.ctaUrl ?? null,
    sortOrder: row.sortOrder,
  };
}
