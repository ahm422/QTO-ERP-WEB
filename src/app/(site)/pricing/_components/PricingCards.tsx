'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Plan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  cta: string;
  features: string[];
  popular?: boolean;
}

interface PricingCardsProps {
  plans: Plan[];
  yearly: boolean;
}

export default function PricingCards({ plans, yearly }: PricingCardsProps) {
  return (
    <div className='grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-center'>
            {plans.map((plan, i) => {
        const isPopular = plan.popular;
        const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;

        return (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ 
              duration: 0.5, 
              delay: i * 0.1,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className={cn(
            'relative rounded-3xl p-1 transition-all duration-500 h-full',
              isPopular ? '' : ''
            )}
          >
            {/* Gradient border for popular plan */}
            {isPopular && (
              <div className='absolute inset-0 rounded-3xl bg-gradient-to-b from-orange-100 via-orange-100 to-amber-100 opacity-100 blur-[1px]' />
            )}

            <div
              className={cn(
                'relative h-full rounded-[22px] overflow-hidden',
                'flex flex-col',
                'bg-white dark:bg-slate-900',
                'transition-all duration-500',
                isPopular
                  ? 'shadow-2xl shadow-orange-500/20 ring-1 ring-orange-500/20'
                  : 'shadow-lg shadow-slate-200/50 dark:shadow-black/20 ring-1 ring-slate-200 dark:ring-slate-800 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/30 hover:-translate-y-1'
              )}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className='absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500' />
              )}

              <div className='p-6 md:p-8 flex flex-col h-full'>
                {/* Header */}
                <div className='mb-6'>
                  {isPopular && (
                    <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold mb-4'>
                      <Sparkles className='w-3 h-3' />
                      Most Popular
                    </div>
                  )}
                  
                  <div className='flex items-center gap-2 mb-2'>
                    {!isPopular && <Zap className='w-5 h-5 text-slate-400' />}
                    <h3 className={cn(
                      'text-xl font-bold',
                      isPopular ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100'
                    )}>
                      {plan.name}
                    </h3>
                  </div>
                  
                  <p className='text-sm text-slate-500 dark:text-slate-400 leading-relaxed'>
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className='mb-6'>
                  <div className='flex items-baseline gap-1'>
                    <span className='text-5xl font-bold tracking-tight text-slate-900 dark:text-white'>
                      ${price}
                    </span>
                    <span className='text-slate-500 dark:text-slate-400 text-sm font-medium'>
                      /mo
                    </span>
                  </div>
                  <p className='text-xs text-slate-400 dark:text-slate-500 mt-1'>
                    per user, billed {yearly ? 'yearly' : 'monthly'}
                  </p>
                </div>

                {/* CTA Button */}
                <Link
                  href='/demo'
                  className={cn(
                    'group relative w-full py-3.5 px-4 rounded-xl font-semibold text-sm',
                    'flex items-center justify-center gap-2',
                    'transition-all duration-300',
                    'mb-8',
                    isPopular
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02]'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
                  )}
                >
                  {plan.cta}
                  <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                </Link>

                {/* Divider */}
                <div className='h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mb-6' />

                {/* Features */}
                <div className='flex-1'>
                  <p className='text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4'>
                    What&apos;s included
                  </p>
                  <ul className='space-y-3'>
                    {plan.features.map((feature, idx) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        className='flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300'
                      >
                        <div className={cn(
                          'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5',
                          isPopular 
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        )}>
                          <Check className='w-3 h-3' strokeWidth={3} />
                        </div>
                        <span className='leading-relaxed'>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}