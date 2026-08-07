'use client';

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useRef, type MouseEvent } from 'react';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { MarketingButton } from '@/components/ui/marketing-button';
import { QTO_DEV_URL } from '@/lib/constants';
import { HeroMotifBackdrop } from './HeroMotif';

const HeroApiConstellation = dynamic(() => import('./HeroApiConstellation'), {
  ssr: false,
  loading: () => (
    <div
      className='aspect-square w-full max-w-xl animate-pulse rounded-full bg-hero-glow/25'
      aria-hidden='true'
    />
  ),
});

const ease = [0.22, 1, 0.36, 1] as const;

const Hero = () => {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smoothX = useSpring(mx, { stiffness: 55, damping: 18 });
  const smoothY = useSpring(my, { stiffness: 55, damping: 18 });
  const spotX = useTransform(smoothX, (v) => v * 100);
  const spotY = useTransform(smoothY, (v) => v * 100);
  const spotBg = useMotionTemplate`radial-gradient(36rem 28rem at ${spotX}% ${spotY}%, color-mix(in oklab, var(--hero-accent) 22%, transparent), transparent 70%)`;

  const tiltX = useSpring(0, { stiffness: 100, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 100, damping: 18 });

  const onMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (reduced || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      mx.set(px);
      my.set(py);
      tiltY.set((px - 0.5) * 8);
      tiltX.set((0.5 - py) * 6);
    },
    [reduced, mx, my, tiltX, tiltY],
  );

  const benefits = [
    'Track time & attendance in real-time',
    'Manage your entire workforce lifecycle',
    'Deliver projects on time, every time',
  ];

  const wordReveal = (text: string, delayBase = 0.35) =>
    text.split(' ').map((word, i) => (
      <span key={`${word}-${i}`} className='inline-block overflow-hidden align-bottom'>
        <motion.span
          className='inline-block'
          initial={reduced ? false : { y: '110%', rotate: 3, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          transition={{
            duration: 0.85,
            delay: delayBase + i * 0.07,
            ease,
          }}
        >
          {word}
          {i < text.split(' ').length - 1 ? '\u00A0' : ''}
        </motion.span>
      </span>
    ));

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      className='relative flex min-h-[640px] w-full items-center overflow-x-clip overflow-y-visible hero-gradient max-h-none py-20 md:min-h-[700px] md:py-24 lg:h-[min(100vh,880px)] lg:max-h-[880px] lg:py-0'
    >
      <div className='absolute inset-0 overflow-hidden'>
        {/* Aurora replaces the old spinning sunburst / rays motif */}
        <HeroMotifBackdrop motif='aurora' />
        {!reduced && (
          <motion.div
            className='absolute inset-0 mix-blend-multiply opacity-80 dark:mix-blend-screen dark:opacity-100'
            style={{ backgroundImage: spotBg }}
          />
        )}
      </div>

      <div className='relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12'>
        <div className='mx-auto max-w-7xl'>
          <div className='grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-16'>
            <div className='text-center lg:text-left'>
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease }}
                className='mb-7'
              >
                <EyebrowBadge
                  icon={Sparkles}
                  label='The Modern ERP Platform'
                  variant='hero'
                />
              </motion.div>

              <h1 className='mb-7 font-display text-[2.5rem] font-bold leading-[1.02] tracking-tight text-hero-foreground sm:text-5xl lg:text-6xl xl:text-[4.75rem]'>
                {wordReveal('The Modern ERP for')}
                <br />
                <span className='font-accent text-[1.05em] italic leading-[1.05] text-hero-accent'>
                  {wordReveal('Growing Teams', 0.65)}
                </span>
              </h1>

              <motion.p
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.9, ease }}
                className='mx-auto mb-9 max-w-lg text-base leading-relaxed text-hero-muted-foreground sm:text-lg md:text-xl lg:mx-0'
              >
                Attendance, HR, and Project Management — unified in one powerful
                platform.
              </motion.p>

              <motion.ul
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.05 }}
                className='mx-auto mb-10 flex max-w-md flex-col gap-3.5 text-hero-muted-foreground lg:mx-0'
              >
                {benefits.map((benefit, i) => (
                  <motion.li
                    key={benefit}
                    initial={reduced ? false : { opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.1 + i * 0.08, ease }}
                    className='flex items-center gap-3.5 text-sm sm:text-[0.95rem]'
                  >
                    <span className='flex size-7 shrink-0 items-center justify-center rounded-full border border-hero-chip-border bg-hero-chip shadow-[0_0_0_4px_color-mix(in_oklab,var(--hero-accent)_8%,transparent)]'>
                      <CheckCircle className='size-3.5 text-hero-accent' strokeWidth={2.25} />
                    </span>
                    <span className='text-left leading-snug'>{benefit}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                initial={reduced ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 1.35, ease }}
                className='mb-7 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start'
              >
                <motion.div
                  whileHover={reduced ? undefined : { scale: 1.03, y: -2 }}
                  whileTap={reduced ? undefined : { scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <MarketingButton variant='hero' size='lg' asChild>
                    <Link href='/demo'>Book a Demo</Link>
                  </MarketingButton>
                </motion.div>
                <motion.div
                  whileHover={reduced ? undefined : { scale: 1.03, y: -2 }}
                  whileTap={reduced ? undefined : { scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <MarketingButton
                    variant='hero-secondary'
                    size='lg'
                    asChild
                    iconSlide={false}
                  >
                    <Link href='/pricing'>See Pricing</Link>
                  </MarketingButton>
                </motion.div>
              </motion.div>

              <motion.a
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                href={QTO_DEV_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1.5 text-sm text-hero-muted-foreground transition-colors hover:text-hero-foreground'
              >
                A product by QTO Dev <ExternalLink className='size-3.5' />
              </motion.a>
            </div>

            <motion.div
              className='relative mx-auto hidden w-full max-w-[38rem] overflow-visible lg:block'
              style={
                reduced
                  ? undefined
                  : {
                      rotateX: tiltX,
                      rotateY: tiltY,
                      transformPerspective: 1100,
                    }
              }
              initial={reduced ? false : { opacity: 0, scale: 0.92, y: 36 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.45, ease }}
            >
              <div className='pointer-events-none absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hero-glow/55 blur-[90px]' />
              <div className='pointer-events-none absolute left-1/2 top-[58%] size-[22rem] -translate-x-1/2 rounded-full bg-hero-glow-alt/45 blur-[70px]' />
              {/* Extra inset so tilted rings aren't clipped by the canvas edge */}
              <div className='relative mx-auto aspect-square w-full max-w-full overflow-visible p-6 sm:p-8'>
                <HeroApiConstellation className='drop-shadow-[0_30px_60px_color-mix(in_oklab,var(--hero-accent)_18%,transparent)]' />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {!reduced && (
        <motion.div
          className='absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-hero-muted-foreground'
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 2, duration: 0.6 }}
        >
          <span className='text-[10px] font-medium uppercase tracking-[0.28em]'>
            Scroll
          </span>
          <motion.span
            className='block h-7 w-px bg-hero-accent/65'
            animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originY: 0 }}
          />
        </motion.div>
      )}
    </section>
  );
};

export default Hero;
