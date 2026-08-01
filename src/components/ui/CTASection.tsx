'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from './button';
import {
  getButtonTap,
  getFadeInUp,
  getCardHover,
  viewportOnce,
} from '@/lib/motion';

const defaultHeadline = 'Ready to Transform Your Operations?';
const defaultPrimaryLabel = 'Book a Demo';
const defaultPrimaryHref = '/demo';
const defaultSecondaryLabel = 'See Pricing';
const defaultSecondaryHref = '/pricing';

export interface CTASectionProps {
  headline?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function CTASection({
  headline = defaultHeadline,
  primaryLabel = defaultPrimaryLabel,
  primaryHref = defaultPrimaryHref,
  secondaryLabel = defaultSecondaryLabel,
  secondaryHref = defaultSecondaryHref,
}: CTASectionProps = {}) {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);
  const tap = getButtonTap(reduced);
  const hover = getCardHover(reduced);

  return (
    <section className='relative py-24 md:py-32 overflow-hidden'>
      <div className='absolute inset-0' />

      <div className='absolute inset-0 overflow-hidden'>
        {!reduced && (
          <>
            <motion.div
              className='absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl'
              animate={{
                x: [0, 100, 0],
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className='absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-black/10 blur-3xl'
              animate={{
                x: [0, -100, 0],
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
      </div>

      <div className='container mx-auto px-4 relative z-10'>
        <motion.div
          variants={fadeUp}
          initial='hidden'
          whileInView='visible'
          viewport={viewportOnce}
          className='max-w-4xl mx-auto'
        >
          <motion.div
            whileHover={hover}
            className='relative bg-white rounded-3xl p-12 md:p-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 backdrop-blur-sm overflow-hidden'
          >
            <div className='relative z-10 text-center'>
              <h2 className='text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-10 leading-tight'>
                {headline}
              </h2>

              <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
                <motion.div whileTap={tap}>
                  <Button
                    variant='default'
                    size='lg'
                    icon={ArrowRight}
                    iconPosition='right'
                  >
                    <Link href={primaryHref}>{primaryLabel}</Link>
                  </Button>
                </motion.div>

                <motion.div whileTap={tap}>
                  <Button
                    variant='outline'
                    size='lg'
                    icon={Play}
                    iconPosition='left'
                  >
                    <Link href={secondaryHref}>{secondaryLabel}</Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
