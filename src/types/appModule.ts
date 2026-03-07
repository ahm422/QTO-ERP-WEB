import { FeaturesType } from "./feature";
import { ProblemsType } from "./problem";
import { UseCasesType } from "./useCase";
import { TestimonialsType } from "./testimonial";
import { FAQsType } from "./faq";
import { AboutContentsType } from "./about";

export type PlatformType = {
  slug: string;
  name: string;
  shortDescription: string;
  highlights: string[];
  bestFor: string;
  cardTagline?: string;
  icon: any;
  videoUrl: string;
  videoCtaTitle?: string;
  videoCtaDescription?: string;
  image?: string;
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

export type PlatformsType = PlatformType[];
