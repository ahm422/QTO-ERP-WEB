'use client';

import { ClipboardCheck, Settings2, Rocket, LineChart } from 'lucide-react';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { StepCardGrid } from '@/components/ui/step-card';
import type { ModuleDetail } from '@/types/content';

type PipelineSectionProps = {
  app: Pick<ModuleDetail, 'name'>;
};

const STEPS = [
  {
    step: 1,
    title: 'Discover fit',
    description:
      'Map workflows and success criteria so the rollout matches how your teams already work.',
    icon: ClipboardCheck,
  },
  {
    step: 2,
    title: 'Configure',
    description:
      'Turn on roles, fields, and integrations — no custom code required for the common path.',
    icon: Settings2,
  },
  {
    step: 3,
    title: 'Deploy',
    description:
      'Pilot with a site or department, then expand with shared templates and training.',
    icon: Rocket,
  },
  {
    step: 4,
    title: 'Optimize',
    description:
      'Use live dashboards and audits to tighten cycle time and keep compliance ready.',
    icon: LineChart,
  },
] as const;

export default function PipelineSection({ app }: PipelineSectionProps) {
  return (
    <section className='section-padding bg-muted/30'>
      <div className='container-main'>
        <HeaderSections
          tag='Pipeline'
          title={`How ${app.name} rolls out`}
          description='A four-step path from shortlist to live operations — same DNA across every module.'
        />
        <StepCardGrid
          steps={STEPS.map((s) => ({
            ...s,
            icon: s.icon,
            iconClassName: 'bg-accent/10 text-accent',
          }))}
        />
      </div>
    </section>
  );
}
