'use client';

import {
  ComparisonTable as SharedComparisonTable,
  type ComparisonColumn,
  type ComparisonRow,
} from '@/components/ui/comparison-table';

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

/** Pricing-page adapter — maps legacy starter/growth/enterprise rows onto shared ComparisonTable. */
export default function ComparisonTable({
  plans,
  comparisonFeatures,
}: ComparisonTableProps) {
  const columns: ComparisonColumn[] = [
    { key: 'starter', name: plans[0]?.name ?? 'Starter' },
    { key: 'growth', name: plans[1]?.name ?? 'Growth' },
    { key: 'enterprise', name: plans[2]?.name ?? 'Enterprise' },
  ];

  const rows: ComparisonRow[] = comparisonFeatures.map((row) => ({
    feature: row.feature,
    values: {
      starter: row.starter,
      growth: row.growth,
      enterprise: row.enterprise,
    },
  }));

  return <SharedComparisonTable columns={columns} rows={rows} />;
}
