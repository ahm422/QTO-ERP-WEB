'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Hash,
  Percent,
  Star,
  Users,
} from 'lucide-react';
import { StatsStrip, type StatItem } from '@/components/common/Stats';
import { getPanelSwap } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { TestimonialType } from '@/types/testimonial';

/** Mock-aligned stats for Reviews (lives in client module — Lucide icons cannot cross RSC). */
export const REVIEWS_STATS: StatItem[] = [
  { value: 4.9, suffix: '/5.0', label: 'Average rating', icon: Star },
  { value: 65, suffix: '%', label: 'Faster rollout', icon: Percent },
  { value: 25000, suffix: '+', label: 'Active seats', icon: Hash },
  { value: 98, suffix: '%', label: 'Satisfaction', icon: Users },
];

interface TestimonialCarouselProps {
  testimonials: TestimonialType[];
  autoPlay?: boolean;
  interval?: number;
  /**
   * Optional 4-tile strip. Prefer `showStats` from Server Components —
   * do not pass Lucide icon components across the RSC boundary.
   */
  stats?: StatItem[];
  /** Renders built-in REVIEWS_STATS (safe from Server Components). */
  showStats?: boolean;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);
}

export default function TestimonialCarousel({
  testimonials,
  autoPlay = true,
  interval = 5000,
  stats,
  showStats = false,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduced = useReducedMotion();
  const panel = getPanelSwap(reduced);
  const listId = useId();

  const stripStats = stats ?? (showStats ? REVIEWS_STATS : undefined);

  const selectIndex = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex]
  );

  const paginate = useCallback(
    (newDirection: number) => {
      setDirection(newDirection);
      setCurrentIndex((prevIndex) => {
        let nextIndex = prevIndex + newDirection;
        if (nextIndex < 0) nextIndex = testimonials.length - 1;
        if (nextIndex >= testimonials.length) nextIndex = 0;
        return nextIndex;
      });
    },
    [testimonials.length]
  );

  useEffect(() => {
    if (!autoPlay || isPaused || reduced) return;
    const timer = setInterval(() => {
      paginate(1);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, isPaused, paginate, reduced]);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const safeIndex =
    currentIndex >= testimonials.length ? 0 : currentIndex;
  const currentTestimonial = testimonials[safeIndex];
  if (!currentTestimonial) {
    return null;
  }

  const rating = currentTestimonial.rating ?? 5;

  return (
    <div className='relative w-full py-6 md:py-10'>
      {stripStats && stripStats.length > 0 ? (
        <StatsStrip stats={stripStats} className='mt-0 mb-10 max-w-5xl px-0 md:mb-14' />
      ) : null}

      <div
        className='relative'
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8'>
          {/* Main quote card — ~2/3 */}
          <div className='relative min-h-80 lg:col-span-2'>
            <AnimatePresence initial={false} custom={direction} mode='wait'>
              <motion.div
                key={safeIndex}
                variants={panel}
                initial='initial'
                animate='animate'
                exit='exit'
                className='h-full'
              >
                <article className='relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[var(--card-shadow)] md:p-8 lg:p-10'>
                  <div className='absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-accent via-accent-dark to-accent' />

                  <div className='mb-5 flex flex-wrap items-center gap-2'>
                    <div className='flex gap-1' aria-label={`${rating} out of 5 stars`}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'size-5',
                            i < rating
                              ? 'fill-accent text-accent'
                              : 'text-muted-foreground/40'
                          )}
                          aria-hidden='true'
                        />
                      ))}
                    </div>
                    {currentTestimonial.selectedSolution ? (
                      <span className='inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent'>
                        {currentTestimonial.selectedSolution}
                      </span>
                    ) : null}
                    {currentTestimonial.badge ? (
                      <span className='inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground'>
                        <BadgeCheck className='size-3.5 shrink-0' aria-hidden='true' />
                        {currentTestimonial.badge}
                      </span>
                    ) : null}
                  </div>

                  <blockquote className='relative flex-1'>
                    <span
                      className='absolute -top-2 -left-1 font-serif text-5xl leading-none text-accent/20'
                      aria-hidden='true'
                    >
                      &ldquo;
                    </span>
                    <p className='pl-4 text-lg leading-relaxed font-medium text-foreground md:text-xl lg:text-2xl'>
                      {currentTestimonial.content}
                    </p>
                  </blockquote>

                  <div className='mt-8 flex items-center gap-4 border-t border-border pt-6'>
                    {currentTestimonial.avatar ? (
                      <img
                        src={currentTestimonial.avatar}
                        alt=''
                        className='size-12 rounded-full border border-border object-cover ring-2 ring-accent/30'
                      />
                    ) : (
                      <div
                        className='flex size-12 items-center justify-center rounded-full bg-linear-to-br from-accent to-accent-dark text-sm font-bold text-accent-foreground ring-2 ring-accent/30'
                        aria-hidden='true'
                      >
                        {initials(currentTestimonial.name)}
                      </div>
                    )}
                    <div className='min-w-0'>
                      <p className='truncate text-base font-semibold text-foreground'>
                        {currentTestimonial.name}
                      </p>
                      <p className='mt-0.5 truncate text-sm text-muted-foreground'>
                        {currentTestimonial.role}
                        {currentTestimonial.company
                          ? ` · ${currentTestimonial.company}`
                          : null}
                      </p>
                    </div>
                  </div>
                </article>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Featured Case Studies list — ~1/3 */}
          <aside className='flex flex-col rounded-2xl border border-border bg-card/60 p-4 md:p-5'>
            <div className='mb-3 flex items-center justify-between gap-2'>
              <h3 className='font-display text-sm font-semibold tracking-tight text-foreground md:text-base'>
                Featured Case Studies
              </h3>
              <div className='flex items-center gap-1'>
                <button
                  type='button'
                  onClick={() => paginate(-1)}
                  className='flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
                  aria-label='Previous case study'
                >
                  <ChevronLeft className='size-4' />
                </button>
                <button
                  type='button'
                  onClick={() => paginate(1)}
                  className='flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
                  aria-label='Next case study'
                >
                  <ChevronRight className='size-4' />
                </button>
              </div>
            </div>

            <div
              role='listbox'
              aria-label='Featured case studies'
              aria-activedescendant={`${listId}-option-${safeIndex}`}
              className='flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1 lg:max-h-96'
            >
              {testimonials.map((item, index) => {
                const isActive = index === safeIndex;
                return (
                  <button
                    key={`${item.company}-${item.name}-${index}`}
                    id={`${listId}-option-${index}`}
                    type='button'
                    role='option'
                    aria-selected={isActive}
                    onClick={() => selectIndex(index)}
                    className={cn(
                      'w-full rounded-xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      isActive
                        ? 'border-accent/40 bg-accent/10 text-foreground shadow-sm'
                        : 'border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <span className='block truncate text-sm font-semibold text-foreground'>
                      {item.company}
                    </span>
                    <span className='mt-0.5 block truncate text-xs text-muted-foreground'>
                      {item.selectedSolution
                        ? `${item.role} · ${item.selectedSolution}`
                        : item.role}
                    </span>
                  </button>
                );
              })}
            </div>

            {autoPlay && !reduced ? (
              <div className='mt-4'>
                <div className='h-1 overflow-hidden rounded-full bg-muted'>
                  <motion.div
                    className='h-full bg-linear-to-r from-accent to-accent-dark'
                    initial={{ width: '0%' }}
                    animate={{ width: isPaused ? '0%' : '100%' }}
                    transition={{ duration: interval / 1000, ease: 'linear' }}
                    key={safeIndex}
                  />
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
