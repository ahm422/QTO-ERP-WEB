'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { QTO_DEV_URL } from '@/lib/constants';
import {
  getFadeInUp,
  getStaggerContainer,
  getStaggerItem,
} from '@/lib/motion';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { GridBackground } from '@/components/ui/grid-background';
import { MarketingButton } from '@/components/ui/marketing-button';
import HeroNodeDiagram from './HeroNodeDiagram';

const Hero = () => {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const fadeUp = getFadeInUp(reduced);

  const benefits = [
    'Track time & attendance in real-time',
    'Manage your entire workforce lifecycle',
    'Deliver projects on time, every time',
  ];

  return (
    <section className='relative flex min-h-screen w-full items-center overflow-hidden hero-gradient'>
      <div className='absolute inset-0 overflow-hidden'>
        {!reduced && (
          <>
            <motion.div
              className='absolute -left-1/4 -top-1/4 size-[28rem] rounded-full bg-hero-glow blur-3xl'
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className='absolute -bottom-1/4 -right-1/4 size-[20rem] rounded-full bg-hero-glow-alt blur-3xl'
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        <GridBackground opacity={0.12} className='absolute inset-0' />
      </div>

      <div className='relative z-10 w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24 xl:px-12'>
        <div className='mx-auto max-w-7xl'>
          <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'>
            <motion.div
              variants={container}
              initial='hidden'
              animate='visible'
              className='text-center lg:text-left'
            >
              <motion.div variants={item} className='mb-6'>
                <EyebrowBadge
                  icon={Sparkles}
                  label='The Modern ERP Platform'
                  variant='muted'
                  className='border-hero-chip-border bg-hero-chip text-hero-foreground'
                />
              </motion.div>

              <motion.h1
                variants={item}
                className='mb-6 font-display text-4xl font-bold leading-tight text-hero-foreground sm:text-5xl lg:text-6xl'
              >
                The Modern ERP for{' '}
                <span className='text-hero-accent'>Growing Teams</span>
              </motion.h1>

              <motion.p
                variants={item}
                className='mx-auto mb-8 max-w-xl text-lg leading-relaxed text-hero-muted-foreground md:text-xl lg:mx-0'
              >
                Attendance, HR, and Project Management — unified in one powerful
                platform.
              </motion.p>

              <motion.ul
                variants={item}
                className='mx-auto mb-8 flex max-w-md flex-col gap-3 text-hero-muted-foreground lg:mx-0'
              >
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className='flex items-center gap-3 text-sm sm:text-base'
                  >
                    <div className='flex size-6 shrink-0 items-center justify-center rounded-full bg-hero-chip'>
                      <CheckCircle className='size-4 text-hero-accent' />
                    </div>
                    {benefit}
                  </li>
                ))}
              </motion.ul>

              <motion.div
                variants={item}
                className='mb-6 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start'
              >
                <MarketingButton variant='hero' size='lg' asChild>
                  <Link href='/demo'>Book a Demo</Link>
                </MarketingButton>
                <MarketingButton
                  variant='hero-secondary'
                  size='lg'
                  asChild
                  iconSlide={false}
                >
                  <Link href='/pricing'>See Pricing</Link>
                </MarketingButton>
              </motion.div>

              <motion.a
                variants={item}
                href={QTO_DEV_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1 text-sm text-hero-muted-foreground transition-colors hover:text-hero-foreground'
              >
                A product by QTO Dev <ExternalLink className='size-4' />
              </motion.a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial='hidden'
              animate='visible'
              className='relative hidden lg:block'
            >
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='size-[22rem] rounded-full bg-hero-glow blur-3xl' />
              </div>

              <motion.div
                className='relative z-10'
                animate={reduced ? undefined : { y: [-6, 6, -6] }}
                transition={
                  reduced
                    ? undefined
                    : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                <HeroNodeDiagram />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
