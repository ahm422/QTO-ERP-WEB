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

interface Value {
  title: string;
  desc: string;
}

export default function ValuesSection() {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const hover = getCardHover(reduced);

  const values: Value[] = [
    {
      title: 'Simplicity First',
      desc: 'Complex problems deserve simple solutions. We cut the clutter so you can focus.',
    },
    {
      title: 'Built to Scale',
      desc: "Whether you're 10 or 10,000 people, QTO-ERP grows with your organization.",
    },
    {
      title: 'Customer Obsessed',
      desc: 'Every feature starts with a real customer problem. We listen, build, and iterate.',
    },
  ];

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
                  {v.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
