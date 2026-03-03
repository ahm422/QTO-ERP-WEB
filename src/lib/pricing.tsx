import {
  PricingPlansType,
  ComparisonFeaturesType,
  PricingFAQsType
} from '@/types';

export const plans: PricingPlansType = [
  {
    name: 'Starter',
    monthlyPrice: 29,
    yearlyPrice: 24,
    description: 'For small teams getting started with workforce management.',
    popular: false,
    features: [
      'Up to 25 employees',
      'Attendance & Time tracking',
      'Basic leave management',
      'Email support',
      'Mobile app access',
      'Standard reports',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Growth',
    monthlyPrice: 79,
    yearlyPrice: 66,
    description: 'For growing teams that need HRM and project tools.',
    popular: true,
    features: [
      'Up to 200 employees',
      'All Starter features',
      'Full HRM module',
      'Project Management',
      'Performance reviews',
      'Priority support',
      'Custom fields & workflows',
      'API access',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    monthlyPrice: 149,
    yearlyPrice: 124,
    description: 'For large organizations with advanced needs.',
    popular: false,
    features: [
      'Unlimited employees',
      'All Growth features',
      'Custom integrations',
      'Dedicated account manager',
      'SLA & uptime guarantee',
      'SSO & advanced security',
      'On-premise option',
      'Custom training',
      'Multi-entity support',
    ],
    cta: 'Contact Sales',
  },
];

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



