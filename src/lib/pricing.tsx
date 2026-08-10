import { ComparisonFeaturesType, PricingFAQsType } from '@/types';
import { PRICING_FAQS_DEFAULTS } from '@/lib/faqs-defaults';

export const comparisonFeatures: ComparisonFeaturesType = [
  {
    feature: 'Employees',
    starter: '25',
    growth: '200',
    enterprise: 'Unlimited',
  },
  { feature: 'Attendance & Time', starter: '✓', growth: '✓', enterprise: '✓' },
  { feature: 'HRM Module', starter: '—', growth: '✓', enterprise: '✓' },
  { feature: 'Project Management', starter: '—', growth: '✓', enterprise: '✓' },
  {
    feature: 'Performance Reviews',
    starter: '—',
    growth: '✓',
    enterprise: '✓',
  },
  { feature: 'Custom Fields', starter: '—', growth: '✓', enterprise: '✓' },
  { feature: 'API Access', starter: '—', growth: '✓', enterprise: '✓' },
  { feature: 'SSO', starter: '—', growth: '—', enterprise: '✓' },
  { feature: 'Dedicated Manager', starter: '—', growth: '—', enterprise: '✓' },
  { feature: 'SLA Guarantee', starter: '—', growth: '—', enterprise: '✓' },
  {
    feature: 'Support',
    starter: 'Email',
    growth: 'Priority',
    enterprise: '24/7 Dedicated',
  },
];

/** Re-export from faqs-defaults to avoid copy drift (seed + legacy consumers). */
export const pricingFaqs: PricingFAQsType = PRICING_FAQS_DEFAULTS.map(
  ({ question, answer }) => ({ question, answer }),
);
