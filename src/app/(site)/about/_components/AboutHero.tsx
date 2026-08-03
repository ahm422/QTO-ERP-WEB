'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { GridBackground } from '@/components/ui/grid-background';
import {
  getFadeInUp,
  getStaggerContainer,
  getStaggerItem,
} from '@/lib/motion';

export default function AboutHero() {
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
          className='mx-auto max-w-3xl'
        >
          <motion.div variants={item} className='mb-6 flex justify-center'>
            <EyebrowBadge
              icon={Building2}
              label='Our Company'
              variant='muted'
              className='border-hero-chip-border bg-hero-chip text-hero-foreground'
            />
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className='mb-4 font-display text-4xl font-bold text-hero-foreground md:text-5xl'
          >
            About QTO-ERP
          </motion.h1>
          <motion.p
            variants={item}
            className='mx-auto max-w-2xl text-lg text-hero-muted-foreground'
          >
            We&apos;re building the modern ERP that growing teams actually love
            to use.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
