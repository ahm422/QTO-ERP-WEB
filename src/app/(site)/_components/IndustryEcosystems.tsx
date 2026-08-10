'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { MarketingButton } from '@/components/ui/marketing-button';
import { EcosystemTabs } from '@/components/common/EcosystemTabs';
import { getDomainIcon } from '@/lib/icon-map';
import { ECOSYSTEM_SECTION_DEFAULT } from '@/lib/home-sections-defaults';
import { INDUSTRY_DOMAINS_DEFAULTS } from '@/lib/industry-domains-defaults';
import type { IndustryEcosystemSection } from '@/types/content';

type IndustryEcosystemsProps = {
  data?: IndustryEcosystemSection;
};

function defaultEcosystem(): IndustryEcosystemSection {
  return {
    section: {
      tag: ECOSYSTEM_SECTION_DEFAULT.tag,
      title: ECOSYSTEM_SECTION_DEFAULT.title,
      accent: ECOSYSTEM_SECTION_DEFAULT.accent,
      description: ECOSYSTEM_SECTION_DEFAULT.description,
    },
    domains: INDUSTRY_DOMAINS_DEFAULTS.map((d, index) => ({
      id: `default-industry-domain-${index}`,
      slug: d.slug,
      name: d.name,
      orderIndex: d.orderIndex,
      systemsCount: d.systemsCount,
      iconKey: d.iconKey,
      description: d.description,
      leaders: d.leaders,
      ctaLabel: d.ctaLabel,
      ctaUrl: d.ctaUrl,
      sortOrder: d.sortOrder,
    })),
  };
}

/** Connected Ecosystem — IndustryEcosystems data on EcosystemTabs shell. */
export default function IndustryEcosystems({ data }: IndustryEcosystemsProps) {
  const resolved =
    data?.domains?.length && data.section ? data : defaultEcosystem();
  const { section, domains } = resolved;

  const selectorItems = domains.map((domain) => ({
    id: domain.slug,
    label: domain.name,
    index: Number.parseInt(domain.orderIndex, 10) || domain.sortOrder + 1,
  }));

  const domainBySlug = new Map(domains.map((d) => [d.slug, d]));

  return (
    <section className='section-padding'>
      <div className='container-main'>
        <HeaderSections
          tag={section.tag}
          title={section.title}
          accent={section.accent}
          description={section.description}
        />

        <EcosystemTabs
          items={selectorItems}
          defaultValue={selectorItems[0]?.id}
          className='mt-10'
          renderDetail={(item) => {
            const domain = domainBySlug.get(item.id);
            if (!domain) return null;

            const Icon = getDomainIcon(domain.iconKey);
            const href = domain.ctaUrl ?? '/allApps';
            const ctaLabel =
              domain.ctaLabel ?? `Explore ${domain.name} Solutions`;

            return (
              <div className='relative space-y-6 overflow-hidden'>
                <Icon
                  aria-hidden='true'
                  className='pointer-events-none absolute -right-4 -top-2 size-40 text-foreground opacity-[0.04] sm:size-48'
                />

                <div className='relative flex flex-wrap items-start gap-4'>
                  <span className='flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 text-foreground'>
                    <Icon aria-hidden='true' className='size-6' />
                  </span>
                  <div className='min-w-0 flex-1 space-y-2'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h3 className='font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl'>
                        {domain.name}
                      </h3>
                      <Badge variant='secondary'>
                        {domain.systemsCount} Systems
                      </Badge>
                    </div>
                    <p className='max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base'>
                      {domain.description}
                    </p>
                  </div>
                </div>

                <div className='relative space-y-3'>
                  <p className='text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground'>
                    Industry Leaders in this Domain
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {domain.leaders.map((leader) => (
                      <Badge key={leader} variant='outline'>
                        {leader}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className='relative pt-1'>
                  <MarketingButton asChild variant='primary'>
                    <Link href={href}>{ctaLabel}</Link>
                  </MarketingButton>
                </div>
              </div>
            );
          }}
        />

        <div className='mt-10 flex justify-center'>
          <MarketingButton asChild variant='secondary'>
            <Link href='/allApps'>View All Industry Domains</Link>
          </MarketingButton>
        </div>
      </div>
    </section>
  );
}
