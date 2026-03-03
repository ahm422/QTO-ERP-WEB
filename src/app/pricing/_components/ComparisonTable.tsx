'use client';
import { HeaderSections } from '@/components/ui/HeaderSections';

interface ComparisonFeature {
  feature: string;
  starter: string;
  growth: string;
  enterprise: string;
}

interface Plan {
  name: string;
}

interface ComparisonTableProps {
  plans: Plan[];
  comparisonFeatures: ComparisonFeature[];
}

export default function ComparisonTable({
  plans,
  comparisonFeatures,
}: ComparisonTableProps) {
  return (
    <section className='section-padding bg-muted/50'>
      <div className='container-main max-w-4xl'>
        <HeaderSections tag='Compare' title='Feature Comparison' />
        <div className='rounded-2xl border border-border bg-card overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-border'>
                <th className='text-left p-4 font-semibold text-foreground'>
                  Feature
                </th>
                {plans.map((p) => (
                  <th
                    key={p.name}
                    className='text-center p-4 font-semibold text-foreground'
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row, i) => (
                <tr key={i} className='border-b border-border last:border-0'>
                  <td className='p-4 text-foreground'>{row.feature}</td>
                  <td className='p-4 text-center text-muted-foreground'>
                    {row.starter}
                  </td>
                  <td className='p-4 text-center text-muted-foreground'>
                    {row.growth}
                  </td>
                  <td className='p-4 text-center text-muted-foreground'>
                    {row.enterprise}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
