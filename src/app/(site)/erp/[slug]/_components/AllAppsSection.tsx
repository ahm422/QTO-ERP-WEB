'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { getModuleIcon } from '@/lib/icon-map';
import { getModuleTintClass } from '@/lib/module-tint';
import { getFadeInUp, viewportOnce } from '@/lib/motion';
import type { ModuleSummary } from '@/types/content';

interface AllAppsSectionProps {
  apps: ModuleSummary[];
  tag: string;
  title: string;
}

export default function AllAppsSection({
  apps,
  tag,
  title,
}: AllAppsSectionProps) {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);
  if (apps.length === 0) return null;

  return (
    <section id='all-apps' className='section-padding'>
      <div className='container-main'>
        <HeaderSections tag={tag} title={title} />
        <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {apps.map((a, index) => {
            const Icon = getModuleIcon(a.iconKey);
            return (
              <motion.div
                key={a.slug}
                variants={fadeUp}
                initial='hidden'
                whileInView='visible'
                viewport={viewportOnce}
                transition={reduced ? undefined : { delay: index * 0.04 }}
              >
                <Link
                  href={`/erp/${a.slug}`}
                  className='group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[var(--card-shadow-hover)]'
                >
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-xl ${getModuleTintClass(
                      a.slug,
                      a.iconKey,
                    )}`}
                  >
                    <Icon className='size-5' aria-hidden />
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='flex items-center gap-1.5 font-display text-base font-bold text-foreground'>
                      {a.name}
                      <ArrowRight
                        className='size-4 -translate-x-1 text-accent opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100'
                        aria-hidden
                      />
                    </span>
                    <span className='mt-1 block text-sm leading-relaxed text-muted-foreground'>
                      {a.cardTagline ?? a.bestFor}
                    </span>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
