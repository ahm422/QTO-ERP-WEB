'use client';

import { HeaderSections } from '@/components/ui/HeaderSections';
import {
  IntegratedModulesGrid,
  type IntegratedModuleItem,
} from '@/components/common/IntegratedModulesGrid';
import { getModuleIcon } from '@/lib/icon-map';
import { getModuleTintClass } from '@/lib/module-tint';
import type { ModuleSummary } from '@/types/content';

interface RecommendedModulesSectionProps {
  modules: ModuleSummary[];
}

export default function RecommendedModulesSection({
  modules,
}: RecommendedModulesSectionProps) {
  if (modules.length === 0) return null;

  const items: IntegratedModuleItem[] = modules.map((app) => ({
    id: app.slug,
    name: app.name,
    description: app.cardTagline ?? app.shortDescription,
    href: `/erp/${app.slug}`,
    icon: getModuleIcon(app.iconKey),
    iconClassName: getModuleTintClass(app.slug, app.iconKey),
  }));

  return (
    <section className='section-padding bg-muted/30'>
      <div className='container-main'>
        <HeaderSections
          tag='Recommended'
          title='Platform For You'
          description="These modules are tailored for your team's needs."
        />
        <IntegratedModulesGrid modules={items} columns={3} />
      </div>
    </section>
  );
}
