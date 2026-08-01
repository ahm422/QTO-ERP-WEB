'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from '@/lib/motion';

interface HeaderSectionsProps {
  tag?: string;
  title: string;
  description?: string;
  centered?: boolean;
}

export function HeaderSections({
  tag,
  title,
  description,
  centered = true,
}: HeaderSectionsProps) {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);

  return (
    <motion.div
      variants={container}
      initial='hidden'
      whileInView='visible'
      viewport={viewportOnce}
      className={`mb-12 ${centered ? 'text-center' : ''}`}
    >
      {tag && (
        <motion.p
          variants={item}
          className='inline-block text-md uppercase tracking-widest text-accent mb-3 font-bold'
        >
          {tag}
        </motion.p>
      )}
      <motion.h2
        variants={item}
        className='text-3xl md:text-4xl font-bold text-foreground mb-4'
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          variants={item}
          className='text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'
        >
          {description}
        </motion.p>
      )}
      <motion.div
        variants={item}
        className='mx-auto mt-4 h-[3px] w-[60px] rounded-sm bg-gradient-to-r from-accent to-accent-dark'
      />
    </motion.div>
  );
}
