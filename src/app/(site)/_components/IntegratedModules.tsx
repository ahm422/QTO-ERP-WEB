'use client';

import Link from 'next/link';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { MarketingButton } from '@/components/ui/marketing-button';
import {
  IntegratedModulesGrid,
  type IntegratedModuleItem,
} from '@/components/common/IntegratedModulesGrid';
import { getModuleIcon } from '@/lib/icon-map';
import { getModuleTintClass } from '@/lib/module-tint';
import type { ModuleSummary } from '@/types/content';

type IntegratedModulesProps = {
  modules: ModuleSummary[];
};

export default function IntegratedModules({ modules }: IntegratedModulesProps) {
  const items: IntegratedModuleItem[] = modules.map((mod) => ({
    id: mod.slug,
    name: mod.name,
    description: mod.cardTagline ?? mod.shortDescription,
    href: `/erp/${mod.slug}`,
    icon: getModuleIcon(mod.iconKey),
    iconClassName: getModuleTintClass(mod.slug, mod.iconKey),
  }));

  return (
    <section className='section-padding bg-muted/30'>
      <div className='container-main'>
        <HeaderSections
          tag='Platform'
          title='Integrated'
          accent='Modules'
          description='Powerful modules designed to work together — explore the catalog and open any product page.'
        />
        <IntegratedModulesGrid modules={items} columns={3} className='mt-2' />
        <div className='mt-12 flex justify-center'>
          <MarketingButton asChild variant='secondary'>
            <Link href='/allApps'>View all modules</Link>
          </MarketingButton>
        </div>
      </div>
    </section>
  );
}
