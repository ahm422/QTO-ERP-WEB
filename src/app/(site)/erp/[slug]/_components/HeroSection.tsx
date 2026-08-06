'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
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
  app: Pick<ModuleDetail, 'heroHeadline' | 'heroSubheadline' | 'heroCtaLabel'>;
  onVideoOpen: () => void;
}

export default function HeroSection({ app }: HeroSectionProps) {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const fadeUp = getFadeInUp(reduced);

  return (
    <section className='relative overflow-hidden hero-gradient section-padding'>
      <GridBackground opacity={0.14} className='absolute inset-0' />

      {!reduced && (
        <>
          <motion.div
            className='absolute -top-32 -right-32 size-80 rounded-full bg-hero-glow blur-3xl'
            animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className='absolute -bottom-24 left-16 size-64 rounded-full bg-hero-glow-alt blur-3xl'
            animate={{ x: [-12, 12, -12] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      <div className='container-main relative z-10 text-center'>
        <motion.div
          variants={container}
          initial='hidden'
          animate='visible'
          className='mx-auto max-w-4xl'
        >
          <motion.div variants={item} className='mb-6 flex justify-center'>
            <EyebrowBadge
              icon={Sparkles}
              label='ERP Module'
              variant='hero'
            />
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className='mb-6 font-display text-4xl font-bold tracking-tight text-hero-foreground sm:text-5xl md:text-6xl lg:text-7xl'
          >
            {app.heroHeadline}
          </motion.h1>

          <motion.p
            variants={item}
            className='mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-hero-muted-foreground md:text-xl'
          >
            {app.heroSubheadline}
          </motion.p>

          <motion.div variants={item} className='flex justify-center'>
            <MarketingButton variant='hero' size='lg' asChild>
              <Link href='/demo'>
                {app.heroCtaLabel ?? 'Schedule a Demo'}
              </Link>
            </MarketingButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
