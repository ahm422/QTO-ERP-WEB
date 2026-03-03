'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

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

// Simple Header Component
const HeaderSections = ({
  tag,
  title,
  description,
}: {
  tag: string;
  title: string;
  description?: string;
}) => (
  <div className='text-center mb-8'>
    <span className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium mb-4'>
      {tag}
    </span>
    <h2 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4'>
      {title}
    </h2>
    {description && (
      <p className='text-slate-500 dark:text-slate-400 max-w-xl mx-auto'>
        {description}
      </p>
    )}
  </div>
);

export default function TestimonialCarousel({
  testimonials,
  autoPlay = true,
  interval = 5000,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.85,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.85,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

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
    [testimonials.length],
  );

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isPaused) return;
    const timer = setInterval(() => {
      paginate(1);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, isPaused, paginate]);

  
 // Safety check for testimonials
  if (!testimonials || testimonials.length === 0) {
    return null;
  }
  const currentTestimonial = testimonials[currentIndex];
   if (!currentTestimonial) {
    return null;
  }
  const rating = currentTestimonial.rating || 5;

  
  return (
    <div className='py-10 px-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden'>

      <section>

        <div className='max-w-5xl mx-auto relative z-10'>

          {/* Carousel Container */}
          <div
            className='relative mt-2'
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Main Card */}
            <div className='relative h-112.5 md:h-137.5 lg:h-125 overflow-hidden px-2'>
              {' '}
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial='enter'
                  animate='center'
                  exit='exit'
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 },
                  }}
                  drag='x'
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={(_, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1);
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1);
                    }
                  }}
                  className='absolute inset-0 cursor-grab active:cursor-grabbing '
                >
                  {/* Enhanced Card with Strong Shadow */}
                  <div className='h-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden  '>
                    {/* gradient overlay on top */}
                    <div className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-orange-500 via-amber-500 to-orange-500' />

                    {/* Subtle background pattern */}
                    <div
                      className='absolute inset-0 opacity-[0.02]'
                      style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)`,
                        backgroundSize: '24px 24px',
                      }}
                    />

                    {/* Rating Stars */}
                    <div className='flex gap-1.5 mb-8'>
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0, rotate: -180 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                        >
                          <Star
                            className={`w-6 h-6 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Testimonial Content - More Prominent */}
                    <blockquote className='text-center mb-10 max-w-3xl relative px-4'>
                      {/* Opening Quote */}
                      <span className='absolute -top-4 -left-2 text-6xl text-orange-500/20 font-serif leading-none'>
                        "
                      </span>

                      <p className='text-xl md:text-2xl lg:text-3xl text-slate-800 dark:text-slate-100 leading-relaxed font-medium'>
                        {currentTestimonial.content}
                      </p>

                      {/* Closing Quote */}
                      <span className='absolute -bottom-8 -right-2 text-6xl text-orange-500/20 font-serif leading-none'>
                        "
                      </span>
                    </blockquote>

                    {/* Divider */}
                    <div className='w-16 h-1 bg-linear-to-r from-orange-500 to-amber-500 rounded-full mb-6' />

                    {/* Author Info */}
                    <div className='flex items-center gap-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur px-4 py-3 shadow-[0_18px_55px_-40px_rgba(0,0,0,0.55)]'>
                      <div className='relative'>
                        {/* glow */}
                        <div className='absolute inset-0 rounded-full bg-orange-500/20 blur-xl' />

                        {currentTestimonial.avatar ? (
                          <img
                            src={currentTestimonial.avatar}
                            alt={currentTestimonial.name}
                            className='relative w-14 h-14 rounded-full object-cover ring-2 ring-orange-500/30 border border-white/70 dark:border-slate-700 shadow-md'
                          />
                        ) : (
                          <div className='relative w-14 h-14 rounded-full bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-base font-bold ring-2 ring-orange-500/30 border border-white/70 dark:border-slate-700 shadow-md'>
                            {currentTestimonial.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                        )}
                      </div>

                      <div className='min-w-0 text-left'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <h4 className='font-semibold text-base md:text-lg text-slate-900 dark:text-white leading-tight truncate'>
                            {currentTestimonial.name}
                          </h4>

                          {currentTestimonial.company ? (
                            <span className='inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300 px-2.5 py-1 text-xs font-semibold'>
                              {currentTestimonial.company}
                            </span>
                          ) : null}
                        </div>

                        <p className='mt-0.5 text-sm text-slate-600 dark:text-slate-300/80 truncate'>
                          {currentTestimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => paginate(-1)}
              className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-xl border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:scale-110 transition-all duration-300 z-10 group'
              aria-label='Previous testimonial'
            >
              <ChevronLeft className='w-6 h-6 group-hover:-translate-x-0.5 transition-transform' />
            </button>

            <button
              onClick={() => paginate(1)}
              className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-xl border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:scale-110 transition-all duration-300 z-10 group'
              aria-label='Next testimonial'
            >
              <ChevronRight className='w-6 h-6 group-hover:translate-x-0.5 transition-transform' />
            </button>

            {/* Dot Indicators */}
            <div className='flex justify-center gap-3 mt-10'>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-10 bg-linear-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30'
                      : 'w-3 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Progress Bar */}
            {autoPlay && (
              <div className='mt-8 max-w-xs mx-auto'>
                <div className='h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden'>
                  <motion.div
                    className='h-full bg-linear-to-r from-orange-500 to-amber-500'
                    initial={{ width: '0%' }}
                    animate={{ width: isPaused ? '0%' : '100%' }}
                    transition={{ duration: interval / 1000, ease: 'linear' }}
                    key={currentIndex}
                  />
                </div>
              </div>
            )}
          </div>
          
        </div>
      </section>
    </div>
  );
}
