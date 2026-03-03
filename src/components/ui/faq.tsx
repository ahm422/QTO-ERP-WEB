'use client';
import React from "react";

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
  className?: string;
  showNumbers?: boolean;
  variant?: 'default' | 'orange' | 'dark';
}

export function FAQAccordion({ 
  faqs, 
  className,
  showNumbers = true,
  variant = 'orange'
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'orange':
        return {
          border: 'border-orange-200 dark:border-orange-900/30',
          borderOpen: 'border-orange-500/50 dark:border-orange-500/40',
          bg: 'bg-white dark:bg-slate-900',
          bgOpen: 'bg-gradient-to-br from-white to-orange-50/80 dark:from-slate-900 dark:to-orange-950/30',
          iconBg: 'bg-orange-100 dark:bg-orange-900/30',
          iconBgHover: 'group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50',
          iconColor: 'text-orange-600 dark:text-orange-400',
          accent: 'from-orange-500 to-amber-500',
          shadow: 'shadow-orange-500/20',
        };
      case 'dark':
        return {
          border: 'border-slate-700',
          borderOpen: 'border-slate-500',
          bg: 'bg-slate-800',
          bgOpen: 'bg-slate-800',
          iconBg: 'bg-slate-700',
          iconBgHover: 'group-hover:bg-slate-600',
          iconColor: 'text-slate-300',
          accent: 'from-slate-500 to-slate-400',
          shadow: 'shadow-slate-500/20',
        };
      default:
        return {
          border: 'border-slate-200 dark:border-slate-700',
          borderOpen: 'border-blue-500/50 dark:border-blue-500/40',
          bg: 'bg-white dark:bg-slate-900',
          bgOpen: 'bg-gradient-to-br from-white to-blue-50/80 dark:from-slate-900 dark:to-blue-950/30',
          iconBg: 'bg-slate-100 dark:bg-slate-800',
          iconBgHover: 'group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30',
          iconColor: 'text-slate-500 dark:text-slate-400',
          accent: 'from-blue-500 to-cyan-500',
          shadow: 'shadow-blue-500/20',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={cn('space-y-4 mb-20 max-w-3xl mx-auto', className)}>
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const number = String(index + 1).padStart(2, '0');

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <div
              className={cn(
                // Base container
                'relative rounded-2xl overflow-hidden',
                'transition-all duration-500 ease-out',
                // Border
                isOpen ? styles.borderOpen : styles.border,
                // Background
                isOpen ? styles.bgOpen : styles.bg,
                // Shadow effects
                'shadow-sm',
                isOpen && `shadow-xl ${styles.shadow}`,
                // Hover lift effect
                'hover:-translate-y-0.5',
                isOpen && '-translate-y-1'
              )}
            >
              {/* Question Header */}
              <button
                onClick={() => handleToggle(index)}
                className={cn(
                  'w-full flex items-center gap-4',
                  'px-2 py-2',
                  'text-left',
                  'transition-colors duration-300',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-offset-2'
                )}
              >
                {/* Number Badge */}
                {showNumbers && (
                  <span
                    className={cn(
                      'flex-shrink-0 w-10 h-10 md:w-12 md:h-12',
                      'flex items-center justify-center',
                      'rounded-xl text-sm md:text-base font-bold',
                      'transition-all duration-300',
                      isOpen
                        ? `bg-gradient-to-br ${styles.accent} text-white shadow-lg`
                        : `bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400`
                    )}
                  >
                    {number}
                  </span>
                )}

                {/* Question Text */}
                <span
                  className={cn(
                    'flex-1 text-base md:text-lg font-semibold',
                    'transition-colors duration-300',
                    isOpen
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-700 dark:text-slate-200'
                  )}
                >
                  {faq.question}
                </span>

                {/* Toggle Icon */}
                <div
                  className={cn(
                    'flex-shrink-0 relative w-10 h-10 md:w-11 md:h-11',
                    'flex items-center justify-center',
                    'rounded-full',
                    'transition-all duration-300',
                    styles.iconBg,
                    styles.iconBgHover,
                    isOpen && `bg-gradient-to-br ${styles.accent} shadow-lg`
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isOpen ? (
                      <motion.div
                        key="minus"
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Minus className="w-5 h-5 text-white" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="plus"
                        initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Plus
                          className={cn(
                            'w-5 h-5 transition-colors',
                            isOpen ? 'text-white' : styles.iconColor
                          )}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>

              {/* Answer Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    <div
                      className={cn(
                        'px-6 pb-6 md:px-8 md:pb-8',
                        'border-t border-slate-250 dark:border-slate-700/50'
                      )}
                    >
                      <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="pt-5"
                      >
                        <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Indicator Line */}
              <div
                className={cn(
                  'absolute left-0 top-0 bottom-0 w-1',
                  'bg-gradient-to-b',
                  styles.accent,
                  'transition-all duration-300',
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