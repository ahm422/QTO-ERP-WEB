import type { AboutContentsType } from "./about";
import type { FAQsType } from "./faq";
import type { FeaturesType } from "./feature";
import type { ProblemsType } from "./problem";
import type { TestimonialsType } from "./testimonial";
import type { UseCasesType } from "./useCase";
import type {
  SolutionFAQType,
  SolutionProblem,
  SolutionUseCase,
} from "./solution";
import type { TestimonialType } from "./testimonial";

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
  videoCtaTitle?: string;
  videoCtaDescription?: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaLabel?: string;
  aboutTitle: string;
  aboutTag?: string;
  aboutDescription: string[];
  aboutContents?: AboutContentsType;
  featuresSectionTitle?: string;
  features: FeaturesType;
  problems: ProblemsType;
  testimonialsSectionTag?: string;
  testimonialsSectionTitle?: string;
  testimonialsSectionDescription?: string;
  useCases: UseCasesType;
  testimonials: TestimonialsType;
  faqs: FAQsType;
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
};

export type BlogPostSummary = {
  slug: string;
  title: string;
  category: string;
  excerpt?: string;
  publishedAt: string;
};

export type BlogPostDetail = BlogPostSummary & {
  content: string;
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
