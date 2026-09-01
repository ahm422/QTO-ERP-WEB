'use client';

import Link from 'next/link';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { GridBackground } from '@/components/ui/grid-background';
import { MarketingButton } from '@/components/ui/marketing-button';
import {
  getFadeInUp,
  getStaggerContainer,
  getStaggerItem,
} from '@/lib/motion';
import type { ModuleDetail } from '@/types/content';

interface HeroSectionProps {
  app: Pick<
    ModuleDetail,
    | 'heroHeadline'
    | 'heroSubheadline'
    | 'heroCtaLabel'
    | 'heroEyebrow'
    | 'highlights'
    | 'ctaPrimaryLabel'
    | 'ctaPrimaryHref'
    | 'ctaSecondaryLabel'
    | 'ctaSecondaryHref'
  >;
  onVideoOpen: () => void;
}

export default function HeroSection({ app }: HeroSectionProps) {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const fadeUp = getFadeInUp(reduced);

  const pills = (app.highlights ?? []).filter(Boolean).slice(0, 4);

  return (
    <section className='relative overflow-hidden hero-gradient'>
      <GridBackground opacity={0.14} className='absolute inset-0' />

      {!reduced && (
        <>
          <motion.div
            className='pointer-events-none absolute -top-40 -right-32 size-[26rem] rounded-full bg-hero-glow blur-[120px]'
            animate={{ y: [0, -24, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className='pointer-events-none absolute -bottom-32 left-4 size-80 rounded-full bg-hero-glow-alt blur-[110px]'
            animate={{ x: [-16, 16, -16] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* soft fade into the next section */}
      <div className='pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background' />

      <div className='container-main relative z-10 px-4 pt-28 pb-24 text-center md:pt-32 md:pb-28'>
        <motion.div
          variants={container}
          initial='hidden'
          animate='visible'
          className='mx-auto max-w-4xl'
        >
          <motion.div variants={item} className='mb-6 flex justify-center'>
            <EyebrowBadge
              icon={Sparkles}
              label={app.heroEyebrow}
              variant='hero'
            />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className='font-display text-4xl font-bold leading-[1.08] tracking-tight text-hero-foreground sm:text-5xl md:text-6xl lg:text-[4.25rem]'
          >
            {app.heroHeadline}
          </motion.h1>

          <motion.p
            variants={item}
            className='mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-hero-muted-foreground md:text-xl'
          >
            {app.heroSubheadline}
          </motion.p>

          <motion.div
            variants={item}
            className='mt-10 flex flex-wrap items-center justify-center gap-3'
          >
            <MarketingButton variant='hero' size='lg' asChild>
              <Link href={app.ctaPrimaryHref}>
                {app.heroCtaLabel ?? app.ctaPrimaryLabel}
              </Link>
            </MarketingButton>
            <MarketingButton
              variant='hero-secondary'
              size='lg'
              asChild
              iconSlide={false}
            >
              <Link href={app.ctaSecondaryHref}>
                {app.ctaSecondaryLabel}
                <ArrowRight className='ml-1.5 size-4' aria-hidden />
              </Link>
            </MarketingButton>
          </motion.div>

          {pills.length > 0 && (
            <motion.ul
              variants={item}
              className='mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-2'
            >
              {pills.map((pill) => (
                <li
                  key={pill}
                  className='inline-flex items-center gap-1.5 rounded-full border border-hero-chip-border bg-hero-chip/60 px-3.5 py-1.5 text-sm font-medium text-hero-muted-foreground backdrop-blur'
                >
                  <Check className='size-3.5 text-hero-accent' aria-hidden />
                  {pill}
                </li>
              ))}
            </motion.ul>
          )}
        </motion.div>
      </div>
    </section>
  );
}
