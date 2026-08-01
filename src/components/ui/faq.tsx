'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFadeInUp, getPanelSwap, viewportOnce } from '@/lib/motion';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
  className?: string;
  showNumbers?: boolean;
  /** @deprecated Token DNA uses accent; kept for call-site compat */
  variant?: 'default' | 'accent' | 'dark';
}

export function FAQAccordion({
  faqs,
  className,
  showNumbers = true,
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);
  const panel = getPanelSwap(reduced);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={cn('mx-auto mb-20 max-w-3xl space-y-4', className)}>
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const number = String(index + 1).padStart(2, '0');

        return (
          <motion.div
            key={faq.question}
            variants={fadeUp}
            initial='hidden'
            whileInView='visible'
            viewport={viewportOnce}
            custom={index}
          >
            <div
              className={cn(
                'relative overflow-hidden rounded-2xl border bg-card shadow-sm',
                'transition-[border-color,box-shadow,transform] duration-300',
                isOpen
                  ? 'border-accent/50 shadow-[var(--card-shadow-hover)]'
                  : 'border-border hover:border-accent/30'
              )}
            >
              <button
                type='button'
                onClick={() => handleToggle(index)}
                className={cn(
                  'flex w-full items-center gap-4 px-4 py-3 text-left md:px-5 md:py-4',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                )}
              >
                {showNumbers ? (
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold md:size-12 md:text-base',
                      'transition-colors duration-300',
                      isOpen
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {number}
                  </span>
                ) : null}

                <span
                  className={cn(
                    'flex-1 text-base font-semibold md:text-lg',
                    isOpen ? 'text-foreground' : 'text-foreground/90'
                  )}
                >
                  {faq.question}
                </span>

                <div
                  className={cn(
                    'relative flex size-10 shrink-0 items-center justify-center rounded-full md:size-11',
                    'transition-colors duration-300',
                    isOpen
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <AnimatePresence mode='wait' initial={false}>
                    {isOpen ? (
                      <motion.div
                        key='minus'
                        variants={panel}
                        initial='initial'
                        animate='animate'
                        exit='exit'
                      >
                        <Minus className='size-5' />
                      </motion.div>
                    ) : (
                      <motion.div
                        key='plus'
                        variants={panel}
                        initial='initial'
                        animate='animate'
                        exit='exit'
                      >
                        <Plus className='size-5' />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={
                      reduced
                        ? { opacity: 0 }
                        : { height: 0, opacity: 0 }
                    }
                    animate={
                      reduced
                        ? { opacity: 1 }
                        : { height: 'auto', opacity: 1 }
                    }
                    exit={
                      reduced
                        ? { opacity: 0 }
                        : { height: 0, opacity: 0 }
                    }
                    transition={{ duration: reduced ? 0.15 : 0.3 }}
                    className='overflow-hidden'
                  >
                    <div className='border-t border-border px-6 pb-6 md:px-8 md:pb-8'>
                      <p className='pt-5 text-sm leading-relaxed text-muted-foreground md:text-base'>
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div
                className={cn(
                  'absolute bottom-0 left-0 top-0 w-1 bg-accent transition-opacity duration-300',
                  isOpen ? 'opacity-100' : 'opacity-0'
                )}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
