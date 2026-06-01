'use client';
import Link from 'next/link';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { getModuleIcon } from '@/lib/icon-map';
import type { ModuleSummary } from '@/types/content';

interface AllAppsSectionProps {
  apps: ModuleSummary[];
}

export default function AllAppsSection({ apps }: AllAppsSectionProps) {
  return (
    <section id="all-apps" className="section-padding">
      <div className="container-main">
        <HeaderSections tag="Explore More" title="See All Applications" />
        <div className="grid md:grid-cols-3 gap-6">
          {apps.map((a) => {
            const Icon = getModuleIcon(a.iconKey);
            return (
              <Link
                key={a.slug}
                href={`/erp/${a.slug}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 card-elevated"
              >
                <Icon className="h-8 w-8 text-accent shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{a.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {a.cardTagline ?? a.bestFor}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
