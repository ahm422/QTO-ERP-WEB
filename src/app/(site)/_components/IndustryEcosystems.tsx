'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { MarketingButton } from '@/components/ui/marketing-button';
import {
  SelectorPanel,
  type SelectorItem,
} from '@/components/ui/selector-panel';
import { getDomainIcon } from '@/lib/icon-map';
import {
  getIndustryDomainById,
  getIndustryDomains,
} from '@/lib/industry-domains';

const domains = getIndustryDomains();

const selectorItems: SelectorItem[] = domains.map((domain) => ({
  id: domain.id,
  label: domain.name,
  index: domain.order,
}));

export default function IndustryEcosystems() {
  return (
    <section className='section-padding bg-muted/30'>
      <div className='container-main'>
        <HeaderSections
          tag='Domains'
          title='Explore by Domain'
          description='See how QTO House modules map to the industries you operate in — pick a domain to preview systems, leaders, and next steps.'
        />

        <SelectorPanel
          items={selectorItems}
          defaultValue={selectorItems[0]?.id}
          listVariant='numbered'
          hideDetailHeader
          listAriaLabel='Select an industry domain'
          className='mt-8 md:grid-cols-[minmax(0,18rem)_1fr] lg:grid-cols-[minmax(0,20rem)_1fr]'
          renderDetail={(item) => {
            const domain = getIndustryDomainById(item.id);
            if (!domain) return null;

            const Icon = getDomainIcon(domain.iconKey);
            const href = domain.href ?? '/allApps';

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
                        {domain.systemCount} Systems
                      </Badge>
                    </div>
                    <p className='max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base'>
                      {domain.description}
                    </p>
                  </div>
                </div>

                <div className='relative space-y-3'>
                  <p className='text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
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
                    <Link href={href}>Explore {domain.name} Solutions</Link>
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
