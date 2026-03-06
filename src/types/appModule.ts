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
  icon: any;
  videoUrl: string;
  videoCtaTitle?: string;
  videoCtaDescription?: string;
  image?: string;
  heroHeadline: string;
  heroSubheadline: string;
  aboutTitle: string;
  aboutTag?: string;
  aboutDescription: string[];
  aboutContents?: AboutContentsType;
  features: FeaturesType;
  problems: ProblemsType;
  useCases: UseCasesType;
  testimonials: TestimonialsType;
  faqs: FAQsType;
};

export type PlatformsType = PlatformType[];
