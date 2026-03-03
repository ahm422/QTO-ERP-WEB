'use client';
import Link from 'next/link';
import { HeaderSections } from '@/components/ui/HeaderSections';

interface App {
  slug: string;
  name: string;
  bestFor: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface AllAppsSectionProps {
  apps: App[];
}

export default function AllAppsSection({ apps }: AllAppsSectionProps) {
  return (
    <section id="all-apps" className="section-padding">
      <div className="container-main">
        <HeaderSections tag="Explore More" title="See All Apps" />
        <div className="grid md:grid-cols-3 gap-6">
          {apps.map((a) => (
            <Link key={a.slug} href={`/erp/${a.slug}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 card-elevated">
              <a.icon className="h-8 w-8 text-accent shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground text-sm">{a.name}</h4>
                <p className="text-xs text-muted-foreground">{a.bestFor}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
