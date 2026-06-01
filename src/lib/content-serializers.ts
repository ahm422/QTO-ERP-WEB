import type { ErpModule, Solution, ComparisonFeature, BlogPost } from "@prisma/client";
import type {
  ModuleDetail,
  ModuleSummary,
  SolutionDetail,
  SolutionSummary,
  BlogPostDetail,
  BlogPostSummary,
  ComparisonRow,
} from "@/types/content";

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
    aboutDescription: m.aboutDescription as string[],
    aboutContents: m.aboutContents as ModuleDetail["aboutContents"],
    featuresSectionTitle: m.featuresSectionTitle ?? undefined,
    features: m.features as ModuleDetail["features"],
    problems: m.problems as ModuleDetail["problems"],
    testimonialsSectionTag: m.testimonialsSectionTag ?? undefined,
    testimonialsSectionTitle: m.testimonialsSectionTitle ?? undefined,
    testimonialsSectionDescription: m.testimonialsSectionDescription ?? undefined,
    useCases: m.useCases as ModuleDetail["useCases"],
    testimonials: m.testimonials as ModuleDetail["testimonials"],
    faqs: m.faqs as ModuleDetail["faqs"],
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
    problems: s.problems as SolutionDetail["problems"],
    recommendedModules: s.recommendedModules as string[],
    testimonial: s.testimonial as SolutionDetail["testimonial"],
    solutionFaqs: s.solutionFaqs as SolutionDetail["solutionFaqs"],
    useCases: (s.useCases as SolutionDetail["useCases"]) ?? undefined,
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
