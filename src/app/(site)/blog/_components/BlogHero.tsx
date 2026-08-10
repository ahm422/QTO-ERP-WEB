'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Newspaper } from 'lucide-react';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { GridBackground } from '@/components/ui/grid-background';
import {
  getFadeInUp,
  getStaggerContainer,
  getStaggerItem,
} from '@/lib/motion';
import type { PageHeroContent } from '@/types/content';

type BlogHeroProps = PageHeroContent;

export default function BlogHero({
  eyebrow,
  title,
  subtitle,
}: BlogHeroProps) {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const fadeUp = getFadeInUp(reduced);

  return (
    <section className='relative overflow-hidden hero-gradient section-padding'>
      <GridBackground opacity={0.12} className='absolute inset-0' />

      <div className='container-main relative z-10 text-center'>
        <motion.div
          variants={container}
          initial='hidden'
          animate='visible'
          className='mx-auto max-w-2xl'
        >
          <motion.div variants={item} className='mb-6 flex justify-center'>
            <EyebrowBadge
              icon={Newspaper}
              label={eyebrow}
              variant='hero'
            />
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className='mb-4 font-display text-4xl font-bold text-hero-foreground md:text-5xl'
          >
            {title}
          </motion.h1>
          <motion.p
            variants={item}
            className='text-lg leading-relaxed text-hero-muted-foreground'
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
