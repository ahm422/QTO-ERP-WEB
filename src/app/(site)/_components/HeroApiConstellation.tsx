'use client';

import { OrbitMotif } from '@/components/ui/orbit-motif';
import { cn } from '@/lib/utils';

/**
 * Home hero constellation — thin wrapper over shared OrbitMotif.
 */
export default function HeroApiConstellation({
  className,
}: {
  className?: string;
}) {
  return (
    <OrbitMotif
      className={cn(className)}
      interactive
      showHints
    />
  );
}
