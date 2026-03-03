'use client';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { motion } from 'framer-motion';

interface Value {
  title: string;
  desc: string;
}

export default function ValuesSection() {
  const values: Value[] = [
    {
      title: 'Simplicity First',
      desc: 'Complex problems deserve simple solutions. We cut the clutter so you can focus.',
    },
    {
      title: 'Built to Scale',
      desc: 'Whether you\'re 10 or 10,000 people, QTO-ERP grows with your organization.',
    },
    {
      title: 'Customer Obsessed',
      desc: 'Every feature starts with a real customer problem. We listen, build, and iterate.',
    },
  ];

  return (
    <section className='section-padding bg-muted/50'>
      <div className='container-main'>
        <HeaderSections tag='Values' title='What We Stand For' />
        <div className='grid md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className='rounded-2xl border border-border bg-card p-6 card-elevated'
            >
              <h4 className='font-semibold text-foreground mb-2'>{v.title}</h4>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                {v.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
