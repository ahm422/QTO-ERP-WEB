import { TestimonialType } from "./testimonial";

export type SolutionProblem = {
  title: string;
  description: string;
};

export type SolutionFAQType = {
  question: string;
  answer: string;
};

export type SolutionUseCaseFeature = {
  tag: string;
  title: string;
  desc: string;
  reverse?: boolean;
};

export type SolutionUseCase = {
  slug: string;
  industry: string;
  description: string;
  specificNeeds: string[];
  subNav?: string[];
  features?: SolutionUseCaseFeature[];
};

export type solutionType = {
  slug: string;
  title: string;
  audience: string;
  heroHeadline: string;
  heroSubheadline: string;
  problems: SolutionProblem[];
  recommendedModules: string[];
  testimonial: TestimonialType;
  solutionFaqs: SolutionFAQType[];
  useCases?: SolutionUseCase[];
};

export type SolutionsType = solutionType[];
