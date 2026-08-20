'use client';

import { cn } from '@/lib/utils';

interface PricingToggleProps {
  yearly: boolean;
  onToggle: (yearly: boolean) => void;
  className?: string;
}

/** Monthly / Annual segmented pill — board billing-toggle DNA. */
export default function PricingToggle({
  yearly,
  onToggle,
  className,
}: PricingToggleProps) {
  return (
    <div
      className={cn('mb-12 flex items-center justify-center gap-3', className)}
      role='group'
      aria-label='Billing period'
    >
      <div className='inline-flex rounded-full border border-border bg-muted/60 p-1'>
        <button
          type='button'
          onClick={() => onToggle(false)}
          aria-pressed={!yearly}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            !yearly
              ? 'bg-accent text-accent-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Monthly
        </button>
        <button
          type='button'
          onClick={() => onToggle(true)}
          aria-pressed={yearly}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            yearly
              ? 'bg-accent text-accent-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Annual
        </button>
      </div>
      {yearly ? (
        <span className='text-xs text-muted-foreground'>Billed annually</span>
      ) : null}
    </div>
  );
}
