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
}

/**
 * FAQ list — border-bottom rows with + / − (SoT motif). Cards optional via numbers.
 */
export function FAQAccordion({
  faqs,
  className,
  showNumbers = false,
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);
  const panel = getPanelSwap(reduced);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={cn('mx-auto max-w-3xl', className)}>
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
            className='border-b border-border'
          >
            <button
              type='button'
              onClick={() => handleToggle(index)}
              aria-expanded={isOpen}
              className={cn(
                'flex w-full items-center gap-4 py-5 text-left md:py-6',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
              )}
            >
              {showNumbers ? (
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold md:size-10 md:text-sm',
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
                  'flex-1 font-display text-base font-semibold tracking-tight md:text-lg',
                  isOpen ? 'text-foreground' : 'text-foreground/90'
                )}
              >
                {faq.question}
              </span>

              <span
                className={cn(
                  'relative flex size-8 shrink-0 items-center justify-center text-muted-foreground transition-colors',
                  isOpen && 'text-accent'
                )}
                aria-hidden
              >
                <AnimatePresence mode='wait' initial={false}>
                  {isOpen ? (
                    <motion.span
                      key='minus'
                      variants={panel}
                      initial='initial'
                      animate='animate'
                      exit='exit'
                      className='absolute'
                    >
                      <Minus className='size-5' strokeWidth={2} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key='plus'
                      variants={panel}
                      initial='initial'
                      animate='animate'
                      exit='exit'
                      className='absolute'
                    >
                      <Plus className='size-5' strokeWidth={2} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={
                    reduced ? { opacity: 0 } : { height: 0, opacity: 0 }
                  }
                  animate={
                    reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }
                  }
                  exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0.15 : 0.3 }}
                  className='overflow-hidden'
                >
                  <p className='pb-6 pr-10 text-sm leading-relaxed text-muted-foreground md:pb-7 md:text-base'>
                    {faq.answer}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
