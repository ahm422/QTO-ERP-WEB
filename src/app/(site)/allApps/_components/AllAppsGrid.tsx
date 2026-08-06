'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { CTASection } from '@/components/ui/CTASection';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { GridBackground } from '@/components/ui/grid-background';
import { MarketingButton } from '@/components/ui/marketing-button';
import { SelectorPanel } from '@/components/ui/selector-panel';
import { getModuleIcon } from '@/lib/icon-map';
import { getFadeInUp } from '@/lib/motion';
import type { ModuleDetail } from '@/types/content';

type AllAppsGridProps = {
  modules: ModuleDetail[];
};

export default function AllAppsGrid({ modules }: AllAppsGridProps) {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);

  const selectorItems = modules.map((app) => ({
    id: app.slug,
    label: app.name,
    description: app.shortDescription,
    icon: getModuleIcon(app.iconKey),
  }));

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
              <EyebrowBadge
                icon={Sparkles}
                label='Comprehensive ERP Suite'
                variant='hero'
              />
            </div>
            <h1 className='mb-6 font-display text-4xl font-bold tracking-tight text-hero-foreground sm:text-5xl lg:text-6xl'>
              Unified Business Management{' '}
              <span className='text-hero-accent'>Platform</span>
            </h1>
            <p className='mx-auto max-w-3xl text-lg leading-relaxed text-hero-muted-foreground sm:text-xl'>
              Discover our integrated suite of enterprise applications designed
              to streamline operations, enhance productivity, and drive growth
              across all business functions.
            </p>
          </motion.div>
        </div>
      </section>

      <section className='section-padding'>
        <div className='container-main'>
          <HeaderSections
            tag='Platforms'
            title='Explore modules'
            description='Select a module to preview highlights, then open the full product page.'
          />

          {selectorItems.length > 0 ? (
            <SelectorPanel
              items={selectorItems}
              defaultValue={selectorItems[0]?.id}
              className='mt-4'
              renderDetail={(item) => {
                const app = modules.find((m) => m.slug === item.id);
                if (!app) return null;
                return (
                  <div className='space-y-5'>
                    <p className='text-sm leading-relaxed text-muted-foreground'>
                      {app.cardTagline ?? app.shortDescription}
                    </p>
                    <p className='text-xs font-medium text-accent'>
                      Best for: {app.bestFor}
                    </p>
                    <ul className='space-y-2'>
                      {app.highlights.map((h) => (
                        <li
                          key={h}
                          className='flex items-center gap-2 text-sm text-muted-foreground'
                        >
                          <CheckCircle className='size-4 shrink-0 text-accent' />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <div className='grid gap-2 border-t border-border pt-4 sm:grid-cols-2'>
                      {app.features.slice(0, 4).map((feature) => (
                        <div
                          key={feature.title}
                          className='flex items-center gap-2 text-xs text-muted-foreground'
                        >
                          <div className='size-1.5 rounded-full bg-accent' />
                          {feature.title}
                        </div>
                      ))}
                    </div>
                    <MarketingButton variant='primary' asChild>
                      <Link href={`/erp/${app.slug}`}>
                        Learn more about {app.name}
                      </Link>
                    </MarketingButton>
                  </div>
                );
              }}
            />
          ) : null}
        </div>
      </section>

      <CTASection
        headline='Ready to Simplify Your Operations with QTO ERP?'
        primaryLabel='Schedule a Demo'
        primaryHref='/demo'
        secondaryLabel='View Pricing'
        secondaryHref='/pricing'
      />
    </>
  );
}
