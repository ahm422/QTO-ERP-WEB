import type { InferSelectModel } from "drizzle-orm";
import {
  aboutStory,
  aboutValues,
  blogPosts,
  builtForCards,
  comparisonFeatures,
  demoPageContent,
  erpModules,
  faqs,
  footerContent,
  homeHero,
  homeSections,
  homeStats,
  industryDomains,
  pricingPageContent,
  pricingPlans,
  pageHeroContent,
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
  FaqItem,
  FooterContent,
  DemoPageContent,
  PricingPageContent,
  PageHeroContent,
  HomeFinalCta,
  AboutStory,
  AboutValue,
} from "@/types/content";
import type { PricingPlan as PricingPlanPublic } from "@/types/pricingPlan";
import { mediaUrl } from "@/lib/media";
import { ensureHtmlContent } from "@/lib/sanitize-html";
import { DEMO_PAGE_CONTENT_DEFAULTS } from "@/lib/demo-page-defaults";
import { HOME_FINAL_CTA_DEFAULTS } from "@/lib/home-cta-defaults";
import {
  ABOUT_STORY_DEFAULTS,
  FALLBACK_STORY_IMAGE_URL,
} from "@/lib/about-story-defaults";
import { ABOUT_FINAL_CTA_DEFAULTS } from "@/lib/about-cta-defaults";

type ErpModule = InferSelectModel<typeof erpModules>;

/** Resolve stored image path: R2 key → /api/media/…; leave absolute/public paths as-is. */
export function resolveMediaPath(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }
  return mediaUrl(value);
}

export function serializeFeatures(features: ErpModule["features"]): ModuleDetail["features"] {
  return features.map((f) => ({
    title: f.title,
    description: f.description,
    icon: f.icon,
    imageKey: f.imageKey,
    imageUrl: resolveMediaPath(f.imageKey) ?? f.imageUrl,
  }));
}

function serializeAboutContents(
  contents: ErpModule["aboutContents"],
): ModuleDetail["aboutContents"] {
  if (!contents) return undefined;
  return contents.map((c) => ({
    ...c,
    image: resolveMediaPath(c.image) ?? c.image,
  }));
}
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
type FaqRow = InferSelectModel<typeof faqs>;
type FooterContentRow = InferSelectModel<typeof footerContent>;
type DemoPageContentRow = InferSelectModel<typeof demoPageContent>;
type PricingPageContentRow = InferSelectModel<typeof pricingPageContent>;
type PageHeroContentRow = InferSelectModel<typeof pageHeroContent>;
type AboutStoryRow = InferSelectModel<typeof aboutStory>;
type AboutValueRow = InferSelectModel<typeof aboutValues>;

export function serializeModuleSummary(m: ErpModule): ModuleSummary {
  return {
    slug: m.slug,
    name: m.name,
    shortDescription: m.shortDescription,
    image: resolveMediaPath(m.image) ?? undefined,
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
    aboutContents: serializeAboutContents(m.aboutContents),
    featuresSectionTitle: m.featuresSectionTitle ?? undefined,
    features: serializeFeatures(m.features),
    capabilities: m.capabilities ?? [],
    rolloutTag: m.rolloutTag ?? undefined,
    rolloutTitleTemplate: m.rolloutTitleTemplate ?? undefined,
    rolloutDescription: m.rolloutDescription ?? undefined,
    rolloutSteps: m.rolloutSteps ?? [],
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

const DEFAULT_BLOG_AUTHOR = "QTO ERP Team";

function blogAuthorName(name?: string | null): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : DEFAULT_BLOG_AUTHOR;
}

export function serializeBlogSummary(
  p: BlogPost,
  authorName?: string | null,
): BlogPostSummary {
  return {
    slug: p.slug,
    title: p.title,
    category: p.category,
    excerpt: p.excerpt ?? undefined,
    publishedAt: p.publishedAt!.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
    coverImageUrl: p.coverImageUrl ?? null,
    tags: p.tags ?? [],
    isFeatured: Boolean(p.isFeatured),
    isCompanyNews: Boolean(p.isCompanyNews),
    readTimeMinutes: p.readTimeMinutes ?? null,
    authorName: blogAuthorName(authorName),
  };
}

export function serializeBlogDetail(
  p: BlogPost,
  authorName?: string | null,
): BlogPostDetail {
  return {
    ...serializeBlogSummary(p, authorName),
    content: p.content,
    metaTitle: p.metaTitle ?? null,
    metaDescription: p.metaDescription ?? null,
  };
}

export function serializeAdminBlogPost(
  post: BlogPost & {
    author?: { email: string; name: string | null } | null;
  },
) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    content: post.content,
    status: post.status,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    author: post.author ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    coverImageUrl: post.coverImageUrl ?? null,
    tags: post.tags ?? [],
    isFeatured: Boolean(post.isFeatured),
    isCompanyNews: Boolean(post.isCompanyNews),
    metaTitle: post.metaTitle ?? null,
    metaDescription: post.metaDescription ?? null,
    viewCount: post.viewCount ?? 0,
    readTimeMinutes: post.readTimeMinutes ?? null,
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

export function serializeFaq(row: FaqRow): FaqItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category ?? null,
    sortOrder: row.sortOrder,
  };
}

export function serializeFooterContent(row: FooterContentRow): FooterContent {
  return {
    brandBlurb: row.brandBlurb,
    builtByLabel: row.builtByLabel,
    builtByUrl: row.builtByUrl,
    newsletterHeading: row.newsletterHeading,
    newsletterCopy: row.newsletterCopy,
    linkGroups: row.linkGroups,
    copyrightText: row.copyrightText,
    bottomLinks: row.bottomLinks,
  };
}

export function serializeDemoPageContent(
  row: DemoPageContentRow,
): DemoPageContent {
  return {
    heroBadge: row.heroBadge,
    heroTitle: row.heroTitle,
    heroAccent: row.heroAccent,
    heroDescription: row.heroDescription,
    heroBadges: row.heroBadges,
    processTag: row.processTag,
    processTitle: row.processTitle,
    processDescription: row.processDescription,
    whatToExpect: row.whatToExpect,
    sideTitle: row.sideTitle,
    sideDescription: row.sideDescription,
    benefits: row.benefits,
    testimonialQuote: row.testimonialQuote,
    testimonialAuthor: row.testimonialAuthor,
    testimonialRole: row.testimonialRole,
    formFieldOptions: {
      ...DEMO_PAGE_CONTENT_DEFAULTS.formFieldOptions,
      ...row.formFieldOptions,
      labels: {
        ...DEMO_PAGE_CONTENT_DEFAULTS.formFieldOptions.labels,
        ...row.formFieldOptions.labels,
      },
      placeholders: {
        ...DEMO_PAGE_CONTENT_DEFAULTS.formFieldOptions.placeholders,
        ...row.formFieldOptions.placeholders,
      },
    },
  };
}

export function serializePricingPageContent(
  row: PricingPageContentRow,
): PricingPageContent {
  return {
    heroBadge: row.heroBadge,
    heroTitle: row.heroTitle,
    heroSubtitle: row.heroSubtitle,
    faqTag: row.faqTag,
    faqTitle: row.faqTitle,
  };
}

export function serializePageHeroContent(
  row: PageHeroContentRow,
): PageHeroContent {
  return {
    eyebrow: row.content.eyebrow,
    title: row.content.title,
    subtitle: row.content.subtitle,
  };
}

function isCtaLink(value: unknown): value is { label: string; url: string } {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.label === "string" && typeof obj.url === "string";
}

export function serializeHomeFinalCta(raw: string | null | undefined): HomeFinalCta {
  return serializeFinalCta(raw, HOME_FINAL_CTA_DEFAULTS);
}

export function serializeAboutFinalCta(raw: string | null | undefined): HomeFinalCta {
  return serializeFinalCta(raw, ABOUT_FINAL_CTA_DEFAULTS);
}

function serializeFinalCta(
  raw: string | null | undefined,
  defaults: HomeFinalCta,
): HomeFinalCta {
  if (!raw) return { ...defaults };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return { ...defaults };
    }
    const obj = parsed as Record<string, unknown>;
    return {
      tag: typeof obj.tag === "string" ? obj.tag : defaults.tag,
      title: typeof obj.title === "string" ? obj.title : defaults.title,
      description:
        typeof obj.description === "string"
          ? obj.description
          : defaults.description,
      primaryCta: isCtaLink(obj.primaryCta)
        ? obj.primaryCta
        : defaults.primaryCta,
      secondaryCta: isCtaLink(obj.secondaryCta)
        ? obj.secondaryCta
        : defaults.secondaryCta,
    };
  } catch {
    return { ...defaults };
  }
}

export function aboutStoryFromDefaults(): AboutStory {
  return {
    imageUrl: FALLBACK_STORY_IMAGE_URL,
    imageAlt: ABOUT_STORY_DEFAULTS.imageAlt,
    badge: ABOUT_STORY_DEFAULTS.badge,
    title: ABOUT_STORY_DEFAULTS.title,
    paragraph1: ensureHtmlContent(ABOUT_STORY_DEFAULTS.paragraph1),
    paragraph2: ensureHtmlContent(ABOUT_STORY_DEFAULTS.paragraph2),
    callout: {
      iconKey: ABOUT_STORY_DEFAULTS.calloutIconKey,
      title: ABOUT_STORY_DEFAULTS.calloutTitle,
      body: ABOUT_STORY_DEFAULTS.calloutBody,
      linkLabel: ABOUT_STORY_DEFAULTS.calloutLinkLabel,
      linkUrl: ABOUT_STORY_DEFAULTS.calloutLinkUrl,
    },
  };
}

export function serializeAboutStory(row: AboutStoryRow): AboutStory {
  return {
    imageUrl: row.imageKey ? mediaUrl(row.imageKey) : FALLBACK_STORY_IMAGE_URL,
    imageAlt: row.imageAlt,
    badge: row.badge,
    title: row.title,
    paragraph1: ensureHtmlContent(row.paragraph1),
    paragraph2: ensureHtmlContent(row.paragraph2),
    callout: {
      iconKey: row.calloutIconKey,
      title: row.calloutTitle,
      body: row.calloutBody,
      linkLabel: row.calloutLinkLabel,
      linkUrl: row.calloutLinkUrl,
    },
  };
}

export function serializeAboutValue(row: AboutValueRow): AboutValue {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    sortOrder: row.sortOrder,
  };
}
