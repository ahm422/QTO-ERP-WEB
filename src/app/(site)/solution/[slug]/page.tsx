import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedSolutionBySlug,
  listPublishedModulesBySlugs,
} from "@/lib/content-db";
import { CTASection } from "@/components/ui/CTASection";
import SolutionHero from "./_components/SolutionHero";
import SolutionTabsContent from "./_components/SolutionTabsContent";
import RecommendedModulesSection from "./_components/RecommendedModulesSection";
import SolutionFaqSection from "./_components/SolutionFaqSection";
import type { SolutionUseCase } from "@/types/solution";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ industry?: string }>;
};

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const solution = await getPublishedSolutionBySlug(slug);
    if (solution) {
      return {
        title: solution.metaTitle,
        description: solution.metaDescription,
      };
    }
  } catch (err) {
    console.error("[solution/[slug]] generateMetadata failed", err);
  }
  return { title: "Solution | QTO ERP" };
}

export default async function SolutionDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { industry } = await searchParams;
  const solution = await getPublishedSolutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  const useCases = (solution.useCases ?? []) as SolutionUseCase[];
  const defaultUseCase = useCases[0];

  const selectedUseCase = industry
    ? useCases.find((uc) => uc.slug === industry)
    : null;

  if (industry && !selectedUseCase) {
    notFound();
  }

  const heroTitle = selectedUseCase
    ? `${solution.title} for ${selectedUseCase.industry}`
    : solution.heroHeadline;

  const heroSubtitle = selectedUseCase
    ? selectedUseCase.description
    : solution.heroSubheadline;

  const tabSource = selectedUseCase ?? defaultUseCase;
  const activeSubNav = tabSource?.subNav ?? [];
  const activeFeatures = tabSource?.features ?? [];

  const recommendedModules = await listPublishedModulesBySlugs(
    solution.recommendedModules,
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SolutionHero
        eyebrow={solution.heroEyebrow}
        title={heroTitle}
        subtitle={heroSubtitle}
        specificNeeds={selectedUseCase?.specificNeeds}
        primaryCtaLabel={solution.heroPrimaryCtaLabel}
        primaryCtaHref={solution.heroPrimaryCtaHref}
        secondaryCtaLabel={solution.heroSecondaryCtaLabel}
        secondaryCtaHref={solution.heroSecondaryCtaHref}
        image={solution.heroImage}
        imageAlt={solution.heroImageAlt}
        caption={solution.heroCaption}
        backHref={selectedUseCase ? `/solution/${slug}` : undefined}
        backLabel={`Back to ${solution.title}`}
      />

      {activeFeatures.length > 0 ? (
        <SolutionTabsContent
          subNav={activeSubNav}
          features={activeFeatures}
          tag={solution.tabsIntroTag}
          title={solution.tabsIntroTitle}
          description={solution.tabsIntroDescription}
          imageFallback={solution.tabImageFallback}
        />
      ) : null}

      <RecommendedModulesSection
        modules={recommendedModules}
        tag={solution.recommendedTag}
        title={solution.recommendedTitle}
        description={solution.recommendedDescription}
      />

      <SolutionFaqSection
        tag={solution.faqTag}
        title={solution.faqTitle}
        faqs={solution.solutionFaqs}
      />

      <CTASection
        eyebrow={solution.ctaEyebrow}
        headline={solution.ctaHeadline}
        description={solution.ctaDescription}
        primaryLabel={solution.ctaPrimaryLabel}
        primaryHref={solution.ctaPrimaryHref}
        secondaryLabel={solution.ctaSecondaryLabel}
        secondaryHref={solution.ctaSecondaryHref}
      />
    </main>
  );
}
