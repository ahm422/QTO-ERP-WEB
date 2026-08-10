'use client';

import { HeaderSections } from '@/components/ui/HeaderSections';
import { Card } from '@/components/ui/card';
import { motion, useReducedMotion } from 'framer-motion';
import {
  getCardHover,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from '@/lib/motion';

type ValueCard = {
  title: string;
  description: string;
};

type ValuesSectionProps = {
  values: ValueCard[];
};

export default function ValuesSection({ values }: ValuesSectionProps) {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const hover = getCardHover(reduced);

  return (
    <section className='section-padding bg-muted/30'>
      <div className='container-main'>
        <HeaderSections tag='Values' title='What We Stand For' />
        <motion.div
          className='mx-auto grid max-w-4xl gap-6 md:grid-cols-3'
          variants={container}
          initial='hidden'
          whileInView='visible'
          viewport={viewportOnce}
        >
          {values.map((v) => (
            <motion.div key={v.title} variants={item} whileHover={hover}>
              <Card variant='interactive' radius='lg' padding='md' className='h-full'>
                <h4 className='mb-2 font-display font-semibold text-foreground'>
                  {v.title}
                </h4>
                <p className='text-sm leading-relaxed text-muted-foreground'>
                  {v.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
