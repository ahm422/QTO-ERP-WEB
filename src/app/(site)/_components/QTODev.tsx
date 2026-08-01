'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { QTO_DEV_URL } from '@/lib/constants';
import { MarketingButton } from '@/components/ui/marketing-button';
import { getFadeInUp, viewportOnce } from '@/lib/motion';

const QTODev = () => {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);

  return (
    <section className='section-padding border-t border-border bg-accent'>
      <div className='container-main'>
        <motion.div
          variants={fadeUp}
          initial='hidden'
          whileInView='visible'
          viewport={viewportOnce}
          className='mx-auto max-w-2xl text-center'
        >
          <h2 className='mb-4 font-display text-2xl font-bold text-accent-foreground md:text-3xl'>
            A Product by{' '}
            <span className='underline decoration-accent-foreground/50 decoration-2 underline-offset-4'>
              QTO Dev
            </span>
          </h2>
          <p className='mb-6 leading-relaxed text-accent-foreground/80'>
            QTO Dev builds modern, scalable SaaS solutions for growing
            businesses. We&apos;re passionate about creating tools that simplify
            complex workflows and empower teams worldwide.
          </p>
          <MarketingButton variant='inverse' size='lg' asChild iconSlide={false}>
            <a href={QTO_DEV_URL} target='_blank' rel='noopener noreferrer'>
              Visit QTO Dev <ExternalLink className='size-4' />
            </a>
          </MarketingButton>
        </motion.div>
      </div>
    </section>
  );
};

export default QTODev;
