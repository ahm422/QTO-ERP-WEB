'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import {
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from '@/lib/motion';
import { cn } from '@/lib/utils';

interface HeaderSectionsProps {
  tag?: string;
  tagIcon?: LucideIcon;
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

export function HeaderSections({
  tag,
  tagIcon,
  title,
  description,
  centered = true,
  className,
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
      className={cn('mb-12', centered && 'text-center', className)}
    >
      {tag ? (
        <motion.div
          variants={item}
          className={cn('mb-4', centered && 'flex justify-center')}
        >
          <EyebrowBadge label={tag} icon={tagIcon} variant='accent' />
        </motion.div>
      ) : null}
      <motion.h2
        variants={item}
        className='mb-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl'
      >
        {title}
      </motion.h2>
      {description ? (
        <motion.p
          variants={item}
          className={cn(
            'text-lg leading-relaxed text-muted-foreground',
            centered && 'mx-auto max-w-2xl'
          )}
        >
          {description}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
