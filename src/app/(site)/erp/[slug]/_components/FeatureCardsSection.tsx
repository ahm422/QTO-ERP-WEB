'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeaderSections } from '@/components/ui/HeaderSections';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardIcon,
  CardTitle,
} from '@/components/ui/card';
import { getModuleIcon } from '@/lib/icon-map';
import { getModuleTintClass } from '@/lib/module-tint';
import type { ModuleDetail } from '@/types/content';

type FeatureCardsSectionProps = {
  app: ModuleDetail;
};

export default function FeatureCardsSection({ app }: FeatureCardsSectionProps) {
  const capabilities =
    app.capabilities?.length > 0
      ? app.capabilities
      : app.features.slice(0, 3).map((f) => ({
          iconKey: app.iconKey,
          title: f.title,
          description: f.description,
          href: '#features' as string | undefined,
        }));
  if (capabilities.length === 0) return null;

  const tint = getModuleTintClass(app.slug, app.iconKey);

  return (
    <section className='section-padding'>
      <div className='container-main'>
        <HeaderSections
          tag={app.capabilitiesTag}
          title={`What ${app.name} unlocks`}
          description={app.capabilitiesDescription}
        />
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {capabilities.map((capability) => {
            const Icon = getModuleIcon(capability.iconKey ?? app.iconKey);
            return (
              <Card
                key={capability.title}
                variant='interactive'
                radius='xl'
                className='h-full'
              >
                <CardHeader className='flex-row items-start gap-3 space-y-0'>
                  <CardIcon className={tint}>
                    <Icon className='size-5' aria-hidden />
                  </CardIcon>
                  <div className='min-w-0 flex-1'>
                    <CardTitle className='font-display text-lg'>
                      {capability.title}
                    </CardTitle>
                    <CardDescription className='mt-2 leading-relaxed'>
                      {capability.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className='pt-0'>
                  <Link
                    href={capability.href ?? '#features'}
                    className='inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline'
                  >
                    {/* Generic per-card affordance + in-page anchor; not marketing copy. */}
                    Explore Module
                    <ArrowRight className='size-3.5' aria-hidden />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
