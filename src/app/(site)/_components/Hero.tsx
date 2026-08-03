'use client';

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useRef, type MouseEvent } from 'react';
import { usePalette } from '@/components/PaletteProvider';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { MarketingButton } from '@/components/ui/marketing-button';
import { QTO_DEV_URL } from '@/lib/constants';
import { HeroMotifBackdrop } from './HeroMotif';

const HeroApiConstellation = dynamic(() => import('./HeroApiConstellation'), {
  ssr: false,
  loading: () => (
    <div
      className='aspect-square w-full max-w-xl animate-pulse rounded-full bg-hero-glow/20'
      aria-hidden='true'
    />
  ),
});

const ease = [0.22, 1, 0.36, 1] as const;

const Hero = () => {
  const reduced = useReducedMotion();
  const { persona } = usePalette();
  const sectionRef = useRef<HTMLElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smoothX = useSpring(mx, { stiffness: 55, damping: 18 });
  const smoothY = useSpring(my, { stiffness: 55, damping: 18 });
  const spotX = useTransform(smoothX, (v) => v * 100);
  const spotY = useTransform(smoothY, (v) => v * 100);
  const spotBg = useMotionTemplate`radial-gradient(42rem 32rem at ${spotX}% ${spotY}%, color-mix(in oklab, var(--hero-accent) 32%, transparent), transparent 68%)`;

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
      tiltY.set((px - 0.5) * 10);
      tiltX.set((0.5 - py) * 8);
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
          initial={reduced ? false : { y: '110%', rotate: 4, opacity: 0 }}
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
      className='relative flex h-screen max-h-[820px] min-h-[600px] w-full items-center overflow-hidden hero-gradient'
    >
      <div className='absolute inset-0 overflow-hidden'>
        <HeroMotifBackdrop motif={persona.heroMotif} />
        {/* Ciao-like mouse-follow aurora */}
        {!reduced && (
          <motion.div
            className='absolute inset-0 mix-blend-screen'
            style={{ backgroundImage: spotBg }}
          />
        )}
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.35)_100%)]' />
      </div>

      <div className='relative z-10 w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24 xl:px-12'>
        <div className='mx-auto max-w-7xl'>
          <div className='grid items-center gap-10 lg:grid-cols-2 lg:gap-8 xl:gap-12'>
            <div className='text-center lg:text-left'>
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease }}
                className='mb-6'
              >
                <EyebrowBadge
                  icon={Sparkles}
                  label='The Modern ERP Platform'
                  variant='muted'
                  className='border-hero-chip-border bg-hero-chip text-hero-foreground'
                />
              </motion.div>

              <h1 className='mb-6 font-display text-4xl font-bold leading-[1.05] text-hero-foreground sm:text-5xl lg:text-6xl xl:text-7xl'>
                {wordReveal('The Modern ERP for')}
                <br />
                <span className='text-hero-accent'>
                  {wordReveal('Growing Teams', 0.65)}
                </span>
              </h1>

              <motion.p
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.9, ease }}
                className='mx-auto mb-8 max-w-xl text-lg leading-relaxed text-hero-muted-foreground md:text-xl lg:mx-0'
              >
                Attendance, HR, and Project Management — unified in one powerful
                platform.
              </motion.p>

              <motion.ul
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.05 }}
                className='mx-auto mb-8 flex max-w-md flex-col gap-3 text-hero-muted-foreground lg:mx-0'
              >
                {benefits.map((benefit, i) => (
                  <motion.li
                    key={benefit}
                    initial={reduced ? false : { opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.1 + i * 0.08, ease }}
                    className='flex items-center gap-3 text-sm sm:text-base'
                  >
                    <motion.div
                      whileHover={reduced ? undefined : { scale: 1.15 }}
                      className='flex size-6 shrink-0 items-center justify-center rounded-full bg-hero-chip'
                    >
                      <CheckCircle className='size-4 text-hero-accent' />
                    </motion.div>
                    {benefit}
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                initial={reduced ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 1.35, ease }}
                className='mb-6 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start'
              >
                <motion.div
                  whileHover={reduced ? undefined : { scale: 1.04, y: -2 }}
                  whileTap={reduced ? undefined : { scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <MarketingButton variant='hero' size='lg' asChild>
                    <Link href='/demo'>Book a Demo</Link>
                  </MarketingButton>
                </motion.div>
                <motion.div
                  whileHover={reduced ? undefined : { scale: 1.04, y: -2 }}
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
                className='inline-flex items-center gap-1 text-sm text-hero-muted-foreground transition-colors hover:text-hero-foreground'
              >
                A product by QTO Dev <ExternalLink className='size-4' />
              </motion.a>
            </div>

            <motion.div
              className='relative mx-auto hidden w-full max-w-xl lg:block'
              style={
                reduced
                  ? undefined
                  : {
                      rotateX: tiltX,
                      rotateY: tiltY,
                      transformPerspective: 900,
                    }
              }
              initial={reduced ? false : { opacity: 0, scale: 0.88, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.45, ease }}
            >
              {/* Soft stage glow — no heavy card chrome */}
              <div className='pointer-events-none absolute left-1/2 top-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hero-glow/50 blur-[80px]' />
              <div className='pointer-events-none absolute left-1/2 top-[60%] size-[20rem] -translate-x-1/2 rounded-full bg-hero-glow-alt/40 blur-[60px]' />
              <HeroApiConstellation />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll cue — Ciao-style */}
      {!reduced && (
        <motion.div
          className='absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-hero-muted-foreground'
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ delay: 2, duration: 0.6 }}
        >
          <span className='text-[10px] uppercase tracking-[0.25em]'>
            Scroll
          </span>
          <motion.span
            className='block h-8 w-px bg-hero-accent/70'
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
