import { ComparisonFeaturesType, PricingFAQsType } from '@/types';

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

export const pricingFaqs: PricingFAQsType = [
  {
    question: 'Is there a free trial?',
    answer:
      'Yes! Every plan comes with a 14-day free trial. No credit card required.',
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Absolutely. Upgrade or downgrade anytime. Changes take effect on your next billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards, bank transfers, and can invoice for Enterprise plans.',
  },
  {
    question: 'Is there a setup fee?',
    answer:
      'No setup fees for Starter and Growth plans. Enterprise includes complimentary onboarding.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      "Yes. Cancel anytime with no penalties. You'll retain access until the end of your billing period.",
  },
];



