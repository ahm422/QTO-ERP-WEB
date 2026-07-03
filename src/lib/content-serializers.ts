import type { InferSelectModel } from "drizzle-orm";
import {
  blogPosts,
  comparisonFeatures,
  erpModules,
  pricingPlans,
  solutions,
} from "@/db/schema";
import type {
  ModuleDetail,
  ModuleSummary,
  SolutionDetail,
  SolutionSummary,
  BlogPostDetail,
  BlogPostSummary,
  ComparisonRow,
} from "@/types/content";
import type { PricingPlan as PricingPlanPublic } from "@/types/pricingPlan";

type ErpModule = InferSelectModel<typeof erpModules>;
type Solution = InferSelectModel<typeof solutions>;
type BlogPost = InferSelectModel<typeof blogPosts>;
type ComparisonFeature = InferSelectModel<typeof comparisonFeatures>;
type PricingPlan = InferSelectModel<typeof pricingPlans>;

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
