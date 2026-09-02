'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CircleAlert } from 'lucide-react';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { Card } from '@/components/ui/card';
import { getCmsIcon } from '@/lib/cms-icons';
import { getFadeInUp, viewportOnce } from '@/lib/motion';
import type { ModuleDetail } from '@/types/content';

type ProblemsSectionProps = {
  app: Pick<
    ModuleDetail,
    'problems' | 'problemsTag' | 'problemsTitle' | 'problemsDescription'
  >;
};

export default function ProblemsSection({ app }: ProblemsSectionProps) {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);

  if (!app.problems?.length) return null;

  return (
    <section id='problems' className='section-padding bg-muted/30'>
      <div className='container-main'>
        <HeaderSections
          tag={app.problemsTag}
          title={app.problemsTitle}
          description={app.problemsDescription}
        />

        <div className='grid gap-6 sm:grid-cols-2'>
          {app.problems.map((pair, index) => {
            const Icon = pair.iconKey ? getCmsIcon(pair.iconKey) : CircleAlert;
            return (
              <motion.div
                key={`${pair.problem}-${index}`}
                variants={fadeUp}
                initial='hidden'
                whileInView='visible'
                viewport={viewportOnce}
                transition={reduced ? undefined : { delay: index * 0.06 }}
              >
                <Card radius='xl' className='h-full p-6'>
                  <div className='flex items-start gap-3'>
                    <Icon
                      className='mt-0.5 size-5 shrink-0 text-accent'
                      aria-hidden
                    />
                    <p className='font-display text-lg font-semibold text-foreground'>
                      {pair.problem}
                    </p>
                  </div>
                  <div className='mt-4 flex items-start gap-3 border-t border-border pt-4'>
                    <ArrowRight
                      className='mt-0.5 size-5 shrink-0 text-muted-foreground'
                      aria-hidden
                    />
                    <p className='leading-relaxed text-muted-foreground'>
                      {pair.solution}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
