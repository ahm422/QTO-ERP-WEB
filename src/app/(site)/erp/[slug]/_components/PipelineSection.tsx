'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { HeaderSections } from '@/components/ui/HeaderSections';
import {
  DEFAULT_MODULE_ROLLOUT_SECTION,
  DEFAULT_MODULE_ROLLOUT_STEPS,
} from '@/lib/contact-page-defaults';
import { getRolloutIcon } from '@/lib/icon-map';
import { getFadeInUp, viewportOnce } from '@/lib/motion';
import type { ModuleDetail } from '@/types/content';

type PipelineSectionProps = {
  app: Pick<
    ModuleDetail,
    | 'name'
    | 'rolloutTag'
    | 'rolloutTitleTemplate'
    | 'rolloutDescription'
    | 'rolloutSteps'
  >;
};

export default function PipelineSection({ app }: PipelineSectionProps) {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);

  const steps =
    app.rolloutSteps?.length > 0
      ? app.rolloutSteps
      : [...DEFAULT_MODULE_ROLLOUT_STEPS];
  const tag = app.rolloutTag ?? DEFAULT_MODULE_ROLLOUT_SECTION.tag;
  const titleTemplate =
    app.rolloutTitleTemplate ?? DEFAULT_MODULE_ROLLOUT_SECTION.titleTemplate;
  const description =
    app.rolloutDescription ?? DEFAULT_MODULE_ROLLOUT_SECTION.description;
  const title = titleTemplate.replace(/\{name\}/g, app.name);

  return (
    <section className='section-padding bg-muted/30'>
      <div className='container-main'>
        <HeaderSections tag={tag} title={title} description={description} />

        <div className='relative mt-14'>
          {/* connector line (desktop) */}
          <div
            className='absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block'
            aria-hidden
          />
          <ol className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
            {steps.map((step, index) => {
              const Icon = getRolloutIcon(step.iconKey);
              return (
                <motion.li
                  key={`${step.step}-${step.title}`}
                  variants={fadeUp}
                  initial='hidden'
                  whileInView='visible'
                  viewport={viewportOnce}
                  transition={reduced ? undefined : { delay: index * 0.08 }}
                  className='relative flex flex-col items-center text-center lg:items-start lg:text-left'
                >
                  <div className='relative z-10 flex size-14 items-center justify-center rounded-2xl border border-border bg-background shadow-[var(--card-shadow)]'>
                    <Icon className='size-6 text-accent' aria-hidden />
                    <span className='absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground'>
                      {step.step}
                    </span>
                  </div>
                  <h3 className='mt-5 font-display text-lg font-bold text-foreground'>
                    {step.title}
                  </h3>
                  <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                    {step.description}
                  </p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
