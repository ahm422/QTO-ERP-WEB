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

export interface HeaderSectionsProps {
  tag?: string;
  tagIcon?: LucideIcon;
  /** Bold Outfit display line. */
  title: string;
  /** Optional orange Instrument Serif italic accent line (two-tone motif). */
  accent?: string;
  description?: string;
  centered?: boolean;
  className?: string;
  /** Heading element — default h2 for sections; hero may pass h1 via SectionHeading. */
  as?: 'h1' | 'h2' | 'h3';
}

/**
 * Marketing section header — eyebrow + two-tone title (display + optional accent) + description.
 */
export function HeaderSections({
  tag,
  tagIcon,
  title,
  accent,
  description,
  centered = true,
  className,
  as: Heading = 'h2',
}: HeaderSectionsProps) {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);

  const titleClass =
    Heading === 'h1'
      ? 'mb-6 font-display text-4xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl'
      : 'mb-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl';

  const accentClass =
    Heading === 'h1'
      ? 'mt-1 block font-accent text-4xl italic leading-[1.02] text-accent sm:text-5xl lg:text-6xl xl:text-7xl'
      : 'mt-1 block font-accent text-4xl italic leading-[1.05] text-accent md:text-5xl lg:text-6xl';

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
      <motion.div variants={item}>
        <Heading className={titleClass}>
          {title}
          {accent ? <span className={accentClass}>{accent}</span> : null}
        </Heading>
      </motion.div>
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

/** Preferred alias for the two-tone heading primitive (#139). */
export const SectionHeading = HeaderSections;
