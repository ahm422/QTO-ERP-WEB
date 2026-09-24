'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { CTASection } from '@/components/ui/CTASection';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { GridBackground } from '@/components/ui/grid-background';
import { getSolutionIcon } from '@/lib/solution-icons';
import {
  getFadeInUp,
  getStaggerContainer,
  staggerItem,
  viewportOnce,
} from '@/lib/motion';
import type { SolutionDetail } from '@/types/content';

type AllSolutionsGridProps = {
  solutions: SolutionDetail[];
};

export default function AllSolutionsGrid({ solutions }: AllSolutionsGridProps) {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);

  return (
    <>
      <section className='relative overflow-hidden hero-gradient section-padding'>
        <GridBackground opacity={0.12} className='absolute inset-0' />
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div className='absolute top-20 right-0 size-72 rounded-full bg-hero-glow blur-3xl' />
          <div className='absolute -bottom-20 -left-20 size-96 rounded-full bg-hero-glow-alt blur-3xl' />
        </div>

        <div className='container-main relative z-10 text-center'>
          <motion.div variants={fadeUp} initial='hidden' animate='visible'>
            <div className='mb-6 flex justify-center'>
              <EyebrowBadge icon={Sparkles} label='Solutions' variant='hero' />
            </div>
            <h1 className='mb-6 font-display text-4xl font-bold tracking-tight text-hero-foreground sm:text-5xl'>
              Built for <span className='text-hero-accent'>Every Team</span>
            </h1>
            <p className='mx-auto max-w-2xl text-lg leading-relaxed text-hero-muted-foreground'>
              Pick the solution that fits how your team works — each one bundles
              the right QTO-ERP modules and workflows for your industry.
            </p>
          </motion.div>
        </div>
      </section>

      <section className='section-padding'>
        <div className='container-main'>
          <HeaderSections
            tag='Solutions'
            title='Explore solutions'
            description='Choose your team, then jump straight to the workflows for your industry.'
          />

          {solutions.length > 0 ? (
            <motion.div
              variants={getStaggerContainer(reduced)}
              initial='hidden'
              whileInView='visible'
              viewport={viewportOnce}
              className='mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3'
            >
              {solutions.map((sol) => {
                const Icon = getSolutionIcon(sol.slug);
                const href = `/solution/${sol.slug}`;
                const useCases = sol.useCases ?? [];
                return (
                  <motion.article
                    key={sol.slug}
                    variants={reduced ? undefined : staggerItem}
                    className='group flex flex-col rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-accent/40'
                  >
                    <div className='mb-4 flex size-11 items-center justify-center rounded-xl bg-accent/12 text-accent'>
                      <Icon className='size-5' />
                    </div>
                    <h2 className='font-display text-lg font-bold text-foreground'>
                      <Link href={href} className='hover:text-accent'>
                        {sol.title}
                      </Link>
                    </h2>
                    <p className='mt-1 text-xs font-semibold uppercase tracking-wider text-accent'>
                      {sol.audience}
                    </p>
                    <p className='mt-3 text-sm leading-relaxed text-muted-foreground'>
                      {sol.heroSubheadline}
                    </p>

                    {useCases.length > 0 && (
                      <ul className='mt-4 flex flex-wrap gap-2'>
                        {useCases.map((uc) => (
                          <li key={uc.slug}>
                            <Link
                              href={`${href}?industry=${encodeURIComponent(uc.slug)}`}
                              className='inline-flex rounded-full border border-border/70 px-2.5 py-1 text-xs text-foreground transition-colors hover:border-accent/40 hover:text-accent'
                            >
                              {uc.industry}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link
                      href={href}
                      className='mt-auto inline-flex items-center gap-1 pt-6 text-xs font-semibold uppercase tracking-wider text-accent'
                    >
                      View solution <ArrowRight className='size-3.5' />
                    </Link>
                  </motion.article>
                );
              })}
            </motion.div>
          ) : (
            <p className='mt-10 text-center text-sm text-muted-foreground'>
              No solutions are published yet.
            </p>
          )}
        </div>
      </section>

      <CTASection
        eyebrow='Ready when you are'
        headline='Ready to Simplify Your Operations with QTO ERP?'
        description='Schedule a walkthrough or get in touch — single orange brand across every surface.'
        primaryLabel='Schedule a Demo'
        primaryHref='/demo'
        secondaryLabel='Contact Us'
        secondaryHref='/contact'
      />
    </>
  );
}
