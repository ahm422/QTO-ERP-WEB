'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { PricingPlan } from '@/types/pricingPlan';
import {
  getCardHover,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from '@/lib/motion';
import { PlanCard } from '@/components/ui/plan-card';

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
        const isCheckoutPlan = CHECKOUT_PLANS.has(plan.slug);

        return (
          <motion.div
            key={plan.slug}
            variants={item}
            whileHover={hover}
            className='h-full'
          >
            <PlanCard
              plan={plan}
              yearly={yearly}
              checkoutEnabled={isCheckoutPlan}
              isLoading={loadingSlug === plan.slug}
              error={errorBySlug[plan.slug]}
              onCheckout={isCheckoutPlan ? startCheckout : undefined}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
