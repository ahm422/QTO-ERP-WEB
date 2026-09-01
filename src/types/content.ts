import type { AboutContentsType } from "./about";
import type { FAQsType } from "./faq";
import type { FeaturesType } from "./feature";
import type {
  ModuleCapabilitiesType,
  ModuleRolloutStepsType,
} from "./module-cms";
import type { ProblemsType } from "./problem";
import type { TestimonialsType } from "./testimonial";
import type { UseCasesType } from "./useCase";
import type {
  SolutionFAQType,
  SolutionProblem,
  SolutionUseCase,
} from "./solution";
import type { TestimonialType } from "./testimonial";
import type {
  ContactFormFieldOptions,
  ContactResponseTimes,
  ContactSupportCard,
} from "@/lib/contact-page-defaults";

export type ModuleSummary = {
  slug: string;
  name: string;
  shortDescription: string;
  image?: string;
  iconKey: string;
  cardTagline?: string;
  highlights: string[];
  bestFor: string;
};

export type ModuleDetail = ModuleSummary & {
  videoUrl: string;
  /** Resolved from the `{name}` template; always populated. */
  videoCtaTitle: string;
  /** Always populated (falls back to MODULE_PAGE_DEFAULTS). */
  videoCtaDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaLabel?: string;
  aboutTitle: string;
  aboutTag?: string;
  aboutDescription: string[];
  aboutContents?: AboutContentsType;
  featuresSectionTitle?: string;
  features: FeaturesType;
  capabilities: ModuleCapabilitiesType;
  rolloutTag?: string;
  rolloutTitleTemplate?: string;
  rolloutDescription?: string;
  rolloutSteps: ModuleRolloutStepsType;
  problems: ProblemsType;
  testimonialsSectionTag?: string;
  testimonialsSectionTitle?: string;
  testimonialsSectionDescription?: string;
  useCases: UseCasesType;
  testimonials: TestimonialsType;
  faqs: FAQsType;
  // ── CMS page-copy (Phase 2). Always populated by serializeModuleDetail,
  //    merged over MODULE_PAGE_DEFAULTS, so components render from props only. ──
  heroEyebrow: string;
  capabilitiesTag: string;
  capabilitiesDescription: string;
  featuresTag: string;
  featuresSectionDescription: string;
  videoCtaButtonLabel: string;
  faqSectionTag: string;
  /** Resolved from the `{name}` template. */
  faqSectionTitle: string;
  aboutSectionHeadings: string[];
  allAppsTag: string;
  allAppsTitle: string;
  ctaHeadline: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  defaultImage: string;
  metaTitle: string;
  metaDescription: string;
};

export type ContactSupportContent = {
  tag: string;
  title: string;
  description: string;
  knowledgeBaseLabel: string;
  knowledgeBaseHref: string;
  cards: ContactSupportCard[];
  responseTimes: ContactResponseTimes;
};

export type ContactChannel = {
  id: string;
  type: string;
  label: string;
  value: string;
  iconKey: string;
  sortOrder: number;
  published: boolean;
};

export type ContactPageContent = {
  sideTitle: string;
  sideDescription: string;
  formFieldOptions: ContactFormFieldOptions;
  faqTag: string;
  faqTitle: string;
  faqDescription: string;
  metaTitle: string;
  metaDescription: string;
};

export type SolutionSummary = {
  slug: string;
  title: string;
  audience: string;
  heroHeadline: string;
  heroSubheadline: string;
};

export type SolutionDetail = SolutionSummary & {
  problems: SolutionProblem[];
  recommendedModules: string[];
  testimonial: TestimonialType;
  solutionFaqs: SolutionFAQType[];
  useCases?: SolutionUseCase[];
  // ── CMS page-copy (Phase 2). Always populated by serializeSolutionDetail,
  //    merged over SOLUTION_PAGE_DEFAULTS. ──
  heroEyebrow: string;
  /** Resolved media path, or null → render the gradient placeholder. */
  heroImage: string | null;
  heroImageAlt: string | null;
  /** Resolved from the `{title}` template. */
  heroCaption: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  tabsIntroTag: string;
  tabsIntroTitle: string;
  tabsIntroDescription: string;
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
  metaTitle: string;
  metaDescription: string;
};

export type BlogPostSummary = {
  slug: string;
  title: string;
  category: string;
  excerpt?: string;
  publishedAt: string;
  updatedAt?: string;
  coverImageUrl?: string | null;
  tags: string[];
  isFeatured: boolean;
  isCompanyNews: boolean;
  readTimeMinutes?: number | null;
  authorName: string;
};

export type BlogPostDetail = BlogPostSummary & {
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export type ComparisonRow = {
  feature: string;
  starter: string;
  growth: string;
  enterprise: string;
};

/** Public / admin DTO for the marketing home hero singleton. */
export type HomeHero = {
  eyebrowText: string;
  titleLine1: string;
  titleAccent: string;
  subtitle: string;
  bullets: string[];
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  poweredByText: string;
  poweredByUrl: string;
};

/** Published module row shaped for home hero orbit admin + mapping. */
export type HeroOrbitModule = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  cardTagline?: string;
  iconKey: string;
  sortOrder: number;
  published: boolean;
  showInHeroOrbit: boolean;
  orbitRadius: number | null;
  orbitTilt: number | null;
  orbitPhase: number | null;
  orbitSpeed: number | null;
};

/** Public DTO for home Trusted By logos. */
export type TrustedLogo = {
  id: string;
  name: string;
  imageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
};

/** Public DTO for home stats strip. */
export type HomeStat = {
  id: string;
  label: string;
  value: number;
  suffix: string;
  iconKey: string;
  sortOrder: number;
};

/** Shared home section header copy (home_sections row). */
export type HomeSectionHeader = {
  tag: string;
  title: string;
  accent: string;
  description: string;
};

/** Public DTO for Built For audience cards. */
export type BuiltForCard = {
  id: string;
  title: string;
  description: string;
  iconKey: string;
  sortOrder: number;
};

export type BuiltForSection = {
  section: HomeSectionHeader;
  cards: BuiltForCard[];
};

/** Public DTO for Connected Ecosystem industry domains. */
export type IndustryDomainSummary = {
  id: string;
  slug: string;
  name: string;
  orderIndex: string;
  systemsCount: number;
  iconKey: string;
  description: string;
  leaders: string[];
  ctaLabel: string | null;
  ctaUrl: string | null;
  sortOrder: number;
};

export type IndustryEcosystemSection = {
  section: HomeSectionHeader;
  domains: IndustryDomainSummary[];
};

/** Public DTO for Pattern A shared page FAQ items. */
export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
};

export type HomeFaqsSection = {
  section: HomeSectionHeader;
  faqs: FaqItem[];
};

/** Public DTO for home final CTA (site_settings home_final_cta JSON). */
export type HomeFinalCta = {
  tag: string;
  title: string;
  description: string;
  primaryCta: { label: string; url: string };
  secondaryCta: { label: string; url: string };
};

/** Public DTO for global footer singleton. */
export type FooterLinkDto = {
  label: string;
  url: string;
  external?: boolean;
};

export type FooterLinkGroupDto = {
  title: string;
  links: FooterLinkDto[];
};

export type FooterContent = {
  brandBlurb: string;
  builtByLabel: string;
  builtByUrl: string;
  newsletterHeading: string;
  newsletterCopy: string;
  linkGroups: FooterLinkGroupDto[];
  copyrightText: string;
  bottomLinks: FooterLinkDto[];
};

export type DemoIconStepDto = {
  iconKey: string;
  title: string;
  description: string;
};

export type DemoFormFieldOptionsDto = {
  labels: {
    name: string;
    email: string;
    phone: string;
    companyPhone: string;
    country: string;
    company: string;
    businessType: string;
  };
  placeholders: {
    name: string;
    email: string;
    phone: string;
    companyPhone: string;
    company: string;
    country: string;
    businessType: string;
  };
  countries: string[];
  businessTypes: Array<{ value: string; label: string }>;
  successMessage?: string;
  submitLabel?: string;
};

export type DemoPageContent = {
  heroBadge: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  heroBadges: string[];
  processTag: string;
  processTitle: string;
  processDescription: string;
  whatToExpect: DemoIconStepDto[];
  sideTitle: string;
  sideDescription: string;
  benefits: DemoIconStepDto[];
  testimonialQuote: string;
  testimonialAuthor: string;
  testimonialRole: string;
  formFieldOptions: DemoFormFieldOptionsDto;
  metaTitle: string;
  metaDescription: string;
};

/** Public DTO for /pricing page singleton (hero + FAQ section chrome). */
export type PricingPageContent = {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  faqTag: string;
  faqTitle: string;
};

/** Shared marketing page hero (page_hero_content JSON). */
export type PageHeroContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

/** Public DTO for /about Our Story singleton. */
export type AboutStory = {
  imageUrl: string;
  imageAlt: string;
  badge: string;
  title: string;
  paragraph1: string;
  paragraph2: string;
  callout: {
    iconKey: string;
    title: string;
    body: string;
    linkLabel: string;
    linkUrl: string;
  };
  metaTitle: string;
  metaDescription: string;
};

/** Public DTO for a published /about values card. */
export type AboutValue = {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
};

/** Bundled /about page payload. */
export type AboutPageContent = {
  hero: PageHeroContent;
  story: AboutStory;
  values: AboutValue[];
  cta: HomeFinalCta;
};
