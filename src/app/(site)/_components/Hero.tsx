'use client';

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useRef, type MouseEvent } from 'react';
import type { OrbitModuleDef } from '@/components/ui/orbit-motif';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { MarketingButton } from '@/components/ui/marketing-button';
import type { HomeHero } from '@/types/content';
import { HeroMotifBackdrop } from './HeroMotif';

function GlobeSkeleton() {
  return (
    <div
      className='aspect-square w-full max-w-xl animate-pulse rounded-full bg-hero-glow/25'
      aria-hidden='true'
    />
  );
}

const HeroGlobe = dynamic(() => import('@/components/ui/hero-globe'), {
  ssr: false,
  loading: () => <GlobeSkeleton />,
});


const ease = [0.22, 1, 0.36, 1] as const;

type HeroProps = {
  hero: HomeHero;
  orbitModules: OrbitModuleDef[];
};

const Hero = ({ hero, orbitModules }: HeroProps) => {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smoothX = useSpring(mx, { stiffness: 55, damping: 18 });
  const smoothY = useSpring(my, { stiffness: 55, damping: 18 });
  const spotX = useTransform(smoothX, (v) => v * 100);
  const spotY = useTransform(smoothY, (v) => v * 100);
  const spotBg = useMotionTemplate`radial-gradient(36rem 28rem at ${spotX}% ${spotY}%, color-mix(in oklab, var(--hero-accent) 22%, transparent), transparent 70%)`;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 48]);
  const glowScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, reduced ? 1 : 1.08],
  );
  const glowOpacity = useTransform(
    scrollYProgress,
    [0, 0.6],
    [1, reduced ? 1 : 0.55],
  );

  const onMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (reduced || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      mx.set(px);
      my.set(py);
    },
    [reduced, mx, my],
  );

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

  const primaryExternal = /^https?:\/\//i.test(hero.primaryCtaUrl);
  const secondaryExternal = /^https?:\/\//i.test(hero.secondaryCtaUrl);

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      className='relative flex min-h-[640px] w-full items-center overflow-x-clip overflow-y-visible hero-gradient max-h-none py-20 md:min-h-[700px] md:py-24 lg:h-[min(100vh,880px)] lg:max-h-[880px] lg:py-0'
    >
      <motion.div
        className='absolute inset-0 overflow-hidden'
        style={reduced ? undefined : { y: parallaxY }}
      >
        <HeroMotifBackdrop motif='aurora' />
        {!reduced && (
          <motion.div
            className='absolute inset-0 mix-blend-multiply opacity-80 dark:mix-blend-screen dark:opacity-100'
            style={{ backgroundImage: spotBg, scale: glowScale, opacity: glowOpacity }}
          />
        )}
      </motion.div>

      <div className='relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12'>
        <div className='mx-auto max-w-7xl'>
          <div className='grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-16'>
            <div className='text-center lg:text-left'>
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease }}
                className='mb-6'
              >
                <EyebrowBadge
                  icon={Sparkles}
                  label={hero.eyebrowText}
                  variant='hero'
                />
              </motion.div>

              <h1 className='mb-6 font-display text-[2.5rem] font-bold leading-[1.02] tracking-tight text-hero-foreground sm:text-5xl lg:text-6xl xl:text-[4.75rem]'>
                {wordReveal(hero.titleLine1)}
                <br />
                <span className='mt-1 inline-block font-accent text-[1.05em] italic leading-[1.08] text-hero-accent'>
                  {wordReveal(hero.titleAccent, 0.65)}
                </span>
              </h1>

              <motion.p
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.9, ease }}
                className='mx-auto mb-8 max-w-lg text-base leading-relaxed text-hero-muted-foreground sm:text-lg md:text-xl lg:mx-0'
              >
                {hero.subtitle}
              </motion.p>

              <motion.ul
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.05 }}
                className='mx-auto mb-9 flex max-w-md flex-col gap-3 text-hero-muted-foreground lg:mx-0'
              >
                {hero.bullets.map((benefit, i) => (
                  <motion.li
                    key={`${benefit}-${i}`}
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
                className='mb-6 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start'
              >
                <motion.div
                  whileHover={reduced ? undefined : { scale: 1.03, y: -2 }}
                  whileTap={reduced ? undefined : { scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <MarketingButton variant='hero' size='lg' asChild>
                    {primaryExternal ? (
                      <a href={hero.primaryCtaUrl} target='_blank' rel='noopener noreferrer'>
                        {hero.primaryCtaLabel}
                      </a>
                    ) : (
                      <Link href={hero.primaryCtaUrl}>{hero.primaryCtaLabel}</Link>
                    )}
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
                    {secondaryExternal ? (
                      <a
                        href={hero.secondaryCtaUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {hero.secondaryCtaLabel}
                      </a>
                    ) : (
                      <Link href={hero.secondaryCtaUrl}>{hero.secondaryCtaLabel}</Link>
                    )}
                  </MarketingButton>
                </motion.div>
              </motion.div>

              <motion.a
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                href={hero.poweredByUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1.5 text-sm text-hero-muted-foreground transition-colors hover:text-hero-foreground'
              >
                {hero.poweredByText} <ExternalLink className='size-3.5' />
              </motion.a>

              {orbitModules.length > 0 ? (
                <ul className='sr-only'>
                  {orbitModules.map((m) => (
                    <li key={m.id}>
                      {m.label}
                      {m.blurb ? `: ${m.blurb}` : ''}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <motion.div
              className='relative mx-auto hidden w-full max-w-[38rem] overflow-visible lg:block'
              initial={reduced ? false : { opacity: 0, scale: 0.92, y: 36 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.45, ease }}
            >
              <div className='pointer-events-none absolute left-1/2 top-1/2 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-hero-glow/40 blur-[110px]' />
              <div className='pointer-events-none absolute left-1/2 top-[58%] size-[24rem] -translate-x-1/2 rounded-full bg-hero-glow-alt/30 blur-[90px]' />
              <div className='relative mx-auto aspect-square w-full max-w-full overflow-visible'>
                <HeroGlobe
                  className='drop-shadow-[0_24px_48px_color-mix(in_oklab,var(--hero-accent)_22%,transparent)]'
                  modules={orbitModules}
                  reducedMotion={!!reduced}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        className='absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2.5 text-hero-muted-foreground'
        initial={reduced ? { opacity: 0.55 } : { opacity: 0 }}
        animate={{ opacity: reduced ? 0.55 : 0.75 }}
        transition={{ delay: reduced ? 0 : 2, duration: 0.6 }}
      >
        <span className='text-[10px] font-medium uppercase tracking-[0.28em]'>
          Scroll
        </span>
        <span className='relative flex h-9 w-5 items-start justify-center rounded-full border border-hero-accent/35 bg-hero-chip/40'>
          {reduced ? (
            <span className='mt-1.5 block size-1 rounded-full bg-hero-accent/70' />
          ) : (
            <motion.span
              className='mt-1.5 block size-1 rounded-full bg-hero-accent'
              animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </span>
      </motion.div>
    </section>
  );
};

export default Hero;
