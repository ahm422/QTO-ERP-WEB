'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { getPanelSwap } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface Testimonial {
  content: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  interval?: number;
}

export default function TestimonialCarousel({
  testimonials,
  autoPlay = true,
  interval = 5000,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduced = useReducedMotion();
  const panel = getPanelSwap(reduced);

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
  const currentTestimonial = testimonials[currentIndex];
  if (!currentTestimonial) {
    return null;
  }
  const rating = currentTestimonial.rating || 5;

  return (
    <div className='relative overflow-hidden px-4 py-10'>
      <div className='relative z-10 mx-auto max-w-5xl'>
        <div
          className='relative mt-2'
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className='relative h-112.5 overflow-hidden px-2 md:h-137.5 lg:h-125'>
            <AnimatePresence initial={false} custom={direction} mode='wait'>
              <motion.div
                key={currentIndex}
                variants={panel}
                initial='initial'
                animate='animate'
                exit='exit'
                className='absolute inset-0'
              >
                <div className='relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-12'>
                  <div className='absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-accent via-accent-dark to-accent' />

                  <div className='mb-8 flex gap-1.5'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'size-6',
                          i < rating
                            ? 'fill-accent text-accent'
                            : 'text-muted-foreground/40'
                        )}
                      />
                    ))}
                  </div>

                  <blockquote className='relative mb-10 max-w-3xl px-4 text-center'>
                    <span className='absolute -top-4 -left-2 font-serif text-6xl leading-none text-accent/20'>
                      &ldquo;
                    </span>
                    <p className='text-xl leading-relaxed font-medium text-foreground md:text-2xl lg:text-3xl'>
                      {currentTestimonial.content}
                    </p>
                    <span className='absolute -right-2 -bottom-8 font-serif text-6xl leading-none text-accent/20'>
                      &rdquo;
                    </span>
                  </blockquote>

                  <div className='mb-6 h-1 w-16 rounded-full bg-linear-to-r from-accent to-accent-dark' />

                  <div className='flex items-center gap-4 rounded-2xl border border-border bg-muted/40 px-4 py-3 backdrop-blur'>
                    <div className='relative'>
                      {currentTestimonial.avatar ? (
                        <img
                          src={currentTestimonial.avatar}
                          alt={currentTestimonial.name}
                          className='relative size-14 rounded-full border border-border object-cover shadow-md ring-2 ring-accent/30'
                        />
                      ) : (
                        <div className='relative flex size-14 items-center justify-center rounded-full bg-linear-to-br from-accent to-accent-dark text-base font-bold text-accent-foreground shadow-md ring-2 ring-accent/30'>
                          {currentTestimonial.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                      )}
                    </div>

                    <div className='min-w-0 text-left'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <h4 className='truncate text-base font-semibold text-foreground md:text-lg'>
                          {currentTestimonial.name}
                        </h4>
                        {currentTestimonial.company ? (
                          <span className='inline-flex items-center rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent'>
                            {currentTestimonial.company}
                          </span>
                        ) : null}
                      </div>
                      <p className='mt-0.5 truncate text-sm text-muted-foreground'>
                        {currentTestimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            type='button'
            onClick={() => paginate(-1)}
            className='absolute top-1/2 left-0 z-10 flex size-14 -translate-x-2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-border bg-card text-muted-foreground shadow-xl transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground md:-translate-x-6'
            aria-label='Previous testimonial'
          >
            <ChevronLeft className='size-6' />
          </button>

          <button
            type='button'
            onClick={() => paginate(1)}
            className='absolute top-1/2 right-0 z-10 flex size-14 translate-x-2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-border bg-card text-muted-foreground shadow-xl transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground md:translate-x-6'
            aria-label='Next testimonial'
          >
            <ChevronRight className='size-6' />
          </button>

          <div className='mt-10 flex justify-center gap-3'>
            {testimonials.map((_, index) => (
              <button
                key={index}
                type='button'
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={cn(
                  'h-3 rounded-full transition-all duration-300',
                  index === currentIndex
                    ? 'w-10 bg-accent shadow-lg shadow-accent/30'
                    : 'w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {autoPlay && !reduced ? (
            <div className='mx-auto mt-8 max-w-xs'>
              <div className='h-1.5 overflow-hidden rounded-full bg-muted'>
                <motion.div
                  className='h-full bg-linear-to-r from-accent to-accent-dark'
                  initial={{ width: '0%' }}
                  animate={{ width: isPaused ? '0%' : '100%' }}
                  transition={{ duration: interval / 1000, ease: 'linear' }}
                  key={currentIndex}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
