import Link from 'next/link';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import {
  getPublishedSolutionBySlug,
  listPublishedModulesBySlugs,
} from '@/lib/content-db';
import { notFound } from 'next/navigation';
import SolutionTabsContent from './_components/SolutionTabsContent';
import RecommendedModulesSection from './_components/RecommendedModulesSection';
import { FAQAccordion } from '@/components/ui/faq';
import { CTASection } from '@/components/ui/CTASection';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { GridBackground } from '@/components/ui/grid-background';
import { MarketingButton } from '@/components/ui/marketing-button';
import { HeaderSections } from '@/components/ui/HeaderSections';
import type { SolutionUseCase } from '@/types/solution';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ industry?: string }>;
};

export const dynamicParams = true;
export const revalidate = 3600;

export default async function HRSoftwareLandingFullWidth({
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
    solution.recommendedModules
  );

  return (
    <main className='min-h-screen bg-background text-foreground'>
      <section className='relative overflow-hidden'>
        <GridBackground opacity={0.2} className='absolute inset-0' />
        <div className='pointer-events-none absolute top-0 right-0 h-[460px] w-[620px] rounded-bl-[170px] bg-accent/15' />
        <div className='pointer-events-none absolute top-[-80px] right-[-120px] h-[520px] w-[520px] rounded-full bg-accent/10 blur-2xl' />

        <div className='relative z-10 px-6 pt-16 pb-12 md:px-16 lg:px-24'>
          <div className='grid max-w-6xl items-center gap-10 md:grid-cols-2'>
            <div>
              {selectedUseCase ? (
                <div className='mb-4'>
                  <Link
                    href={`/solution/${slug}`}
                    className='inline-flex items-center gap-2 text-sm text-accent hover:underline'
                  >
                    <ArrowLeft className='size-4' />
                    Back to {solution.title}
                  </Link>
                </div>
              ) : null}

              <EyebrowBadge
                icon={Sparkles}
                label='Solution'
                variant='accent'
                className='mb-4'
              />

              <h1 className='font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl'>
                {heroTitle}
              </h1>

              <p className='mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg'>
                {heroSubtitle}
              </p>

              {selectedUseCase?.specificNeeds ? (
                <ul className='mt-6 grid gap-2 sm:grid-cols-2'>
                  {selectedUseCase.specificNeeds.map((need) => (
                    <li
                      key={need}
                      className='flex items-center gap-2 text-sm text-muted-foreground'
                    >
                      <Check
                        className='size-4 shrink-0 text-accent'
                        aria-hidden
                      />
                      {need}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className='mt-8 flex flex-wrap gap-3'>
                <MarketingButton variant='primary' size='lg' asChild>
                  <Link href='/demo'>Request a Demo</Link>
                </MarketingButton>
                <MarketingButton
                  variant='secondary'
                  size='lg'
                  asChild
                  iconSlide={false}
                >
                  <Link href='/pricing'>See Pricing</Link>
                </MarketingButton>
              </div>
            </div>

            <div className='relative rounded-3xl border border-border bg-card p-8 shadow-[var(--card-shadow)]'>
              <div className='aspect-4/3 rounded-2xl bg-linear-to-br from-accent/20 via-accent/5 to-muted' />
              <p className='mt-4 text-center text-sm text-muted-foreground'>
                Unified workflows for {solution.title.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {activeFeatures.length > 0 ? (
        <SolutionTabsContent subNav={activeSubNav} features={activeFeatures} />
      ) : null}

      <RecommendedModulesSection modules={recommendedModules} />

      {solution.solutionFaqs && solution.solutionFaqs.length > 0 ? (
        <section className='section-padding bg-muted/40'>
          <div className='container-main'>
            <HeaderSections
              tag='Got Questions?'
              title='Frequently Asked Questions'
            />
            <FAQAccordion faqs={solution.solutionFaqs} />
          </div>
        </section>
      ) : null}

      <CTASection />
    </main>
  );
}
