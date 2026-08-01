'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import {
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from '@/lib/motion';
import { cn } from '@/lib/utils';

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
      className={cn('mb-12', centered && 'text-center')}
    >
      {tag ? (
        <motion.div
          variants={item}
          className={cn('mb-4', centered && 'flex justify-center')}
        >
          <EyebrowBadge label={tag} variant='accent' />
        </motion.div>
      ) : null}
      <motion.h2
        variants={item}
        className='font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl mb-4'
      >
        {title}
      </motion.h2>
      {description ? (
        <motion.p
          variants={item}
          className={cn(
            'text-lg text-muted-foreground leading-relaxed',
            centered && 'mx-auto max-w-2xl'
          )}
        >
          {description}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
