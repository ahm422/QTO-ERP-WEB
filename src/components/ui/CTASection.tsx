'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { DarkCtaBand } from '@/components/ui/dark-cta-band';
import { MarketingButton } from '@/components/ui/marketing-button';
import { getFadeInUp, viewportOnce } from '@/lib/motion';

const defaultHeadline = 'Ready to Transform Your Operations?';
const defaultPrimaryLabel = 'Book a Demo';
const defaultPrimaryHref = '/demo';
const defaultSecondaryLabel = 'See Pricing';
const defaultSecondaryHref = '/pricing';

export interface CTASectionProps {
  headline?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

/**
 * Site-wide marketing CTA — thin wrapper over DarkCtaBand + inverse MarketingButtons.
 * Prefer this import at page call sites so copy/href props stay stable.
 */
export function CTASection({
  headline = defaultHeadline,
  primaryLabel = defaultPrimaryLabel,
  primaryHref = defaultPrimaryHref,
  secondaryLabel = defaultSecondaryLabel,
  secondaryHref = defaultSecondaryHref,
}: CTASectionProps = {}) {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);

  return (
    <section className='relative section-padding'>
      <div className='container-main'>
        <motion.div
          variants={fadeUp}
          initial='hidden'
          whileInView='visible'
          viewport={viewportOnce}
          className='mx-auto max-w-5xl'
        >
          <DarkCtaBand
            title={headline}
            primaryAction={
              <MarketingButton variant='inverse' size='lg' asChild>
                <Link href={primaryHref}>{primaryLabel}</Link>
              </MarketingButton>
            }
            secondaryAction={
              <MarketingButton
                variant='inverse-secondary'
                size='lg'
                asChild
                iconSlide={false}
              >
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </MarketingButton>
            }
          />
        </motion.div>
      </div>
    </section>
  );
}
