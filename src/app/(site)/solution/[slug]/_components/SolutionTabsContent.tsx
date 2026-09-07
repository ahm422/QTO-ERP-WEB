'use client';

import { MediaImage } from '@/components/ui/MediaImage';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { SelectorPanel } from '@/components/ui/selector-panel';
import type { LucideIcon } from 'lucide-react';
import {
  Layers,
  LayoutDashboard,
  Settings2,
  Sparkles,
  Users,
  Workflow,
} from 'lucide-react';

type Feature = {
  tag: string;
  title: string;
  desc: string;
  reverse?: boolean;
  imageUrl?: string;
};

type Props = {
  subNav: string[];
  features: Feature[];
  tag: string;
  title: string;
  description: string;
  /** Local motif image used when a feature has no imageUrl of its own. */
  imageFallback: string;
};

const FEATURE_ICONS: LucideIcon[] = [
  Sparkles,
  Layers,
  Workflow,
  Users,
  LayoutDashboard,
  Settings2,
];

function toId(label: string) {
  return label
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function SolutionTabsContent({
  subNav,
  features,
  tag,
  title,
  description,
  imageFallback,
}: Props) {
  const sectionTabs = features.map(
    (feature, idx) => subNav[idx] ?? feature.tag
  );

  const items = features.map((feature, idx) => {
    const label = sectionTabs[idx] ?? feature.tag;
    return {
      id: toId(label) || `feature-${idx}`,
      label,
      description: feature.tag,
      icon: FEATURE_ICONS[idx % FEATURE_ICONS.length],
    };
  });

  if (items.length === 0) return null;

  return (
    <section className='section-padding bg-muted/30'>
      <div className='container-main'>
        <div className='mb-10 text-center'>
          <div className='mb-4 flex justify-center'>
            <EyebrowBadge label={tag} variant='accent' />
          </div>
          <h2 className='font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl'>
            {title}
          </h2>
          <p className='mx-auto mt-3 max-w-2xl text-muted-foreground'>
            {description}
          </p>
        </div>

        <SelectorPanel
          items={items}
          defaultValue={items[0]?.id}
          renderDetail={(item) => {
            const idx = items.findIndex((i) => i.id === item.id);
            const feature = features[idx];
            if (!feature) return null;
            const imageUrl = feature.imageUrl ?? imageFallback;

            return (
              <div className='grid gap-6 lg:grid-cols-2 lg:items-center'>
                <div className='relative overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--card-shadow)]'>
                  <div className='relative aspect-video w-full'>
                    <MediaImage
                      src={imageUrl}
                      alt={feature.title}
                      fill
                      className='object-cover'
                    />
                  </div>
                </div>
                <div>
                  <EyebrowBadge label={feature.tag} variant='muted' />
                  <h3 className='mt-3 font-display text-2xl font-bold tracking-tight text-foreground whitespace-pre-line md:text-3xl'>
                    {feature.title}
                  </h3>
                  <p className='mt-4 text-sm leading-relaxed text-muted-foreground md:text-base'>
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          }}
        />
      </div>
    </section>
  );
}
