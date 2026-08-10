'use client';

import { HeaderSections } from '@/components/ui/HeaderSections';
import { StepCardGrid } from '@/components/ui/step-card';
import {
  DEFAULT_MODULE_ROLLOUT_SECTION,
  DEFAULT_MODULE_ROLLOUT_STEPS,
} from '@/lib/contact-page-defaults';
import { getRolloutIcon } from '@/lib/icon-map';
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
        <StepCardGrid
          steps={steps.map((s) => ({
            step: s.step,
            title: s.title,
            description: s.description,
            icon: getRolloutIcon(s.iconKey),
            iconClassName: 'bg-accent/10 text-accent',
          }))}
        />
      </div>
    </section>
  );
}
