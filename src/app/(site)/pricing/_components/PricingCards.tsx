'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Sparkles, Zap, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { PricingPlan } from '@/types/pricingPlan';
import {
  getCardHover,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from '@/lib/motion';
import { Card } from '@/components/ui/card';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { MarketingButton } from '@/components/ui/marketing-button';

interface PricingCardsProps {
  plans: PricingPlan[];
  yearly: boolean;
}

const CHECKOUT_PLANS = new Set(['starter', 'growth']);

export default function PricingCards({ plans, yearly }: PricingCardsProps) {
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const [errorBySlug, setErrorBySlug] = useState<Record<string, string>>({});
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const hover = getCardHover(reduced);

  async function startCheckout(planSlug: string) {
    setLoadingSlug(planSlug);
    setErrorBySlug((prev) => {
      const next = { ...prev };
      delete next[planSlug];
      return next;
    });

    try {
      const res = await fetch('/api/pricing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug,
          interval: yearly ? 'yearly' : 'monthly',
        }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setErrorBySlug((prev) => ({
          ...prev,
          [planSlug]:
            data.error ?? 'Could not start checkout. Please try again.',
        }));
        return;
      }

      window.location.href = data.url;
    } catch {
      setErrorBySlug((prev) => ({
        ...prev,
        [planSlug]: 'Network error. Please try again.',
      }));
    } finally {
      setLoadingSlug(null);
    }
  }

  return (
    <motion.div
      className='mx-auto grid max-w-6xl items-stretch gap-6 md:grid-cols-3 lg:gap-8'
      variants={container}
      initial='hidden'
      whileInView='visible'
      viewport={viewportOnce}
    >
      {plans.map((plan) => {
        const isPopular = plan.popular;
        const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
        const isCheckoutPlan = CHECKOUT_PLANS.has(plan.slug);
        const isLoading = loadingSlug === plan.slug;
        const error = errorBySlug[plan.slug];

        return (
          <motion.div
            key={plan.slug}
            variants={item}
            whileHover={hover}
            className='h-full'
          >
            <Card
              variant='interactive'
              radius='xl'
              padding='none'
              className={cn(
                'flex h-full flex-col overflow-hidden',
                isPopular && 'border-accent ring-1 ring-accent/25',
              )}
            >
              {isPopular ? (
                <div className='h-1.5 w-full bg-accent' />
              ) : null}

              <div className='flex h-full flex-col p-6 md:p-8'>
                <div className='mb-6'>
                  {isPopular ? (
                    <div className='mb-4'>
                      <EyebrowBadge
                        icon={Sparkles}
                        label='Most Popular'
                        variant='accent'
                      />
                    </div>
                  ) : null}

                  <div className='mb-2 flex items-center gap-2'>
                    {!isPopular ? (
                      <Zap className='size-5 text-muted-foreground' />
                    ) : null}
                    <h3 className='font-display text-xl font-bold text-foreground'>
                      {plan.name}
                    </h3>
                  </div>

                  <p className='text-sm leading-relaxed text-muted-foreground'>
                    {plan.description}
                  </p>
                </div>

                <div className='mb-6'>
                  <div className='flex items-baseline gap-1'>
                    <span className='font-display text-5xl font-bold tracking-tight text-foreground'>
                      ${price}
                    </span>
                    <span className='text-sm font-medium text-muted-foreground'>
                      /mo
                    </span>
                  </div>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    per user, billed {yearly ? 'yearly' : 'monthly'}
                  </p>
                </div>

                <div className='mb-8'>
                  {isCheckoutPlan ? (
                    <MarketingButton
                      type='button'
                      onClick={() => startCheckout(plan.slug)}
                      disabled={isLoading}
                      variant={isPopular ? 'primary' : 'secondary'}
                      className='mb-2 w-full'
                      iconSlide={!isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='size-4 animate-spin' aria-hidden />
                          Processing…
                        </>
                      ) : (
                        plan.cta
                      )}
                    </MarketingButton>
                  ) : (
                    <MarketingButton
                      variant={isPopular ? 'primary' : 'secondary'}
                      className='mb-2 w-full'
                      asChild
                    >
                      <Link href='/contact'>{plan.cta}</Link>
                    </MarketingButton>
                  )}
                  {error ? (
                    <p className='mt-2 text-center text-xs text-destructive'>
                      {error}
                    </p>
                  ) : null}
                </div>

                <div className='mb-6 h-px bg-border' />

                <div className='flex-1'>
                  <p className='mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                    What&apos;s included
                  </p>
                  <ul className='space-y-3'>
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className='flex items-start gap-3 text-sm text-muted-foreground'
                      >
                        <div
                          className={cn(
                            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                            isPopular
                              ? 'bg-accent/15 text-accent'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          <Check className='size-3' strokeWidth={3} />
                        </div>
                        <span className='leading-relaxed text-foreground/90'>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
