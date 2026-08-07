'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { CTASection } from '@/components/ui/CTASection';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { GridBackground } from '@/components/ui/grid-background';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  IntegratedModulesGrid,
  type IntegratedModuleItem,
} from '@/components/common/IntegratedModulesGrid';
import { getModuleIcon } from '@/lib/icon-map';
import { getModuleTintClass } from '@/lib/module-tint';
import { getFadeInUp } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ModuleDetail } from '@/types/content';

type AllAppsGridProps = {
  modules: ModuleDetail[];
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'hr', label: 'HR' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'crm', label: 'CRM' },
  { id: 'payroll', label: 'Payroll' },
  { id: 'mfg', label: 'Manufacturing' },
  { id: 'accounting', label: 'Accounting' },
] as const;

function matchesFilter(mod: ModuleDetail, filter: string): boolean {
  if (filter === 'all') return true;
  const hay = `${mod.slug} ${mod.iconKey} ${mod.name}`.toLowerCase();
  const map: Record<string, RegExp> = {
    hr: /hr|attendance|workforce|people/,
    inventory: /inventory|fleet|warehouse|asset/,
    crm: /crm|sales|pipeline|lead/,
    payroll: /payroll|pay/,
    mfg: /mfg|manufactur|production/,
    accounting: /account|finance|ledger/,
  };
  return map[filter]?.test(hay) ?? true;
}

export default function AllAppsGrid({ modules }: AllAppsGridProps) {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return modules.filter((mod) => {
      if (!matchesFilter(mod, filter)) return false;
      if (!q) return true;
      return (
        mod.name.toLowerCase().includes(q) ||
        mod.shortDescription.toLowerCase().includes(q) ||
        (mod.cardTagline?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [modules, query, filter]);

  const gridItems: IntegratedModuleItem[] = filtered.map((mod) => ({
    id: mod.slug,
    name: mod.name,
    description: mod.cardTagline ?? mod.shortDescription,
    href: `/erp/${mod.slug}`,
    icon: getModuleIcon(mod.iconKey),
    iconClassName: getModuleTintClass(mod.slug, mod.iconKey),
  }));

  return (
    <>
      <section className='relative overflow-hidden hero-gradient section-padding'>
        <GridBackground opacity={0.12} className='absolute inset-0' />
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <div className='absolute top-20 right-0 size-72 rounded-full bg-hero-glow blur-3xl' />
          <div className='absolute -bottom-20 -left-20 size-96 rounded-full bg-hero-glow-alt blur-3xl' />
        </div>

        <div className='container-main relative z-10 text-center'>
          <motion.div variants={fadeUp} initial='hidden' animate='visible'>
            <div className='mb-6 flex justify-center'>
              <EyebrowBadge
                icon={Sparkles}
                label='Comprehensive ERP Suite'
                variant='hero'
              />
            </div>
            <h1 className='mb-6 font-display text-4xl font-bold tracking-tight text-hero-foreground sm:text-5xl'>
              Unified Business Management{' '}
              <span className='text-hero-accent'>Platform</span>
            </h1>
            <p className='mx-auto max-w-2xl text-lg leading-relaxed text-hero-muted-foreground'>
              Explore every QTO-ERP module in one catalog — filter by capability,
              then open the full product page.
            </p>
          </motion.div>
        </div>
      </section>

      <section className='section-padding'>
        <div className='container-main'>
          <HeaderSections
            tag='Platforms'
            title='Explore modules'
            description='Search and filter the catalog, then open any module card.'
          />

          <div className='mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='relative w-full max-w-md'>
              <Search
                className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'
                aria-hidden
              />
              <Input
                type='search'
                placeholder='Search modules…'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className='pl-9'
                aria-label='Search modules'
              />
            </div>
            <div
              className='flex flex-wrap gap-2'
              role='group'
              aria-label='Filter by module family'
            >
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type='button'
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                >
                  <Badge
                    variant={filter === f.id ? 'accent' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors',
                      filter === f.id ? '' : 'hover:bg-muted',
                    )}
                  >
                    {f.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {gridItems.length > 0 ? (
            <IntegratedModulesGrid
              modules={gridItems}
              columns={3}
              className='mt-10'
            />
          ) : (
            <p className='mt-10 text-center text-sm text-muted-foreground'>
              No modules match your search. Try another filter or clear the query.
            </p>
          )}

          <p className='mt-8 text-center text-sm text-muted-foreground'>
            Looking for a walkthrough?{' '}
            <Link href='/demo' className='font-medium text-accent hover:underline'>
              Book a demo
            </Link>
          </p>
        </div>
      </section>

      <CTASection
        eyebrow='Ready when you are'
        headline='Ready to Simplify Your Operations with QTO ERP?'
        description='Schedule a walkthrough or compare plans — single orange brand across every surface.'
        primaryLabel='Schedule a Demo'
        primaryHref='/demo'
        secondaryLabel='View Pricing'
        secondaryHref='/pricing'
      />
    </>
  );
}
