'use client';

import { OrbitMotif, type OrbitModuleDef } from '@/components/ui/orbit-motif';
import { cn } from '@/lib/utils';

/**
 * Home hero constellation — thin wrapper over shared OrbitMotif.
 */
export default function HeroApiConstellation({
  className,
  modules,
}: {
  className?: string;
  modules?: OrbitModuleDef[];
}) {
  return (
    <OrbitMotif
      className={cn(className)}
      interactive
      showHints
      modules={modules}
    />
  );
}
