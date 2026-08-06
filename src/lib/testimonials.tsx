import type { GeneralFAQsType } from '@/types';
import type { TestimonialType } from '@/types/testimonial';

export const globalTestimonials: TestimonialType[] = [
  {
    content:
      'We cut payroll processing time by 60% after switching to this attendance system.',
    name: 'Sarah Chen',
    role: 'HR Director',
    company: 'TechFlow Inc.',
    rating: 5,
    selectedSolution: 'Attendance',
  },
  {
    content:
      'Onboarding went from 2 weeks of chaos to a smooth 3-day process.',
    name: 'Lisa Park',
    role: 'People Ops Manager',
    company: 'ScaleUp Labs',
    rating: 5,
    selectedSolution: 'HRM',
  },
  {
    content: 'We went from 40% on-time delivery to 92% in three months.',
    name: 'Michael Torres',
    role: 'VP of Engineering',
    company: 'DevCore Systems',
    rating: 5,
    selectedSolution: 'Project Management',
  },
  {
    content:
      'One platform replaced four tools and gave me the oversight I was missing.',
    name: 'David Kim',
    role: 'CEO',
    company: 'NovaTech Solutions',
    rating: 5,
    selectedSolution: 'ERP Suite',
  },
  {
    content:
      'The resource allocation view alone saved us from burning out two senior developers.',
    name: 'Emily Watson',
    role: 'Project Director',
    company: 'Catalyst Agency',
    rating: 5,
    selectedSolution: 'Project Management',
  },
  {
    content:
      'Finally, one place for everything. No more digging through shared drives.',
    name: 'Ahmed Hassan',
    role: 'HR Business Partner',
    company: 'GlobalTech',
    rating: 5,
    selectedSolution: 'HRM',
  },
];

export const customerLogos = [
  'TechFlow Inc.',
  'ScaleUp Labs',
  'DevCore Systems',
  'NovaTech Solutions',
  'Catalyst Agency',
  'GlobalTech',
  'BuildRight Co.',
  'Nexus Dynamics',
  'Horizon Group',
  'Vertex Solutions',
  'Apex Industries',
  'Summit Corp',
];

export const generalFaqs: GeneralFAQsType = [
  {
    question: 'What is this platform?',
    answer:
      'A modern ERP suite for managing attendance, HR, and projects — designed for growing businesses.',
    category: 'General',
  },
  {
    question: 'Is it cloud-based?',
    answer:
      'Yes. Fully cloud-based with 99.9% uptime SLA. Access from any device, anywhere.',
    category: 'General',
  },
  {
    question: 'How long does setup take?',
    answer:
      'Most teams are up and running within a day. Enterprise setups with data migration typically take 1-2 weeks.',
    category: 'Getting Started',
  },
  {
    question: 'Do you offer training?',
    answer:
      'Yes. All plans include access to our knowledge base and video tutorials. Growth and Enterprise plans include live training sessions.',
    category: 'Getting Started',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. We use enterprise-grade encryption, regular security audits, and comply with SOC 2 and GDPR.',
    category: 'Security',
  },
  {
    question: 'Can I export my data?',
    answer:
      'Yes. Export any data in CSV, Excel, or via our API at any time. Your data is always yours.',
    category: 'Security',
  },
  {
    question: 'What integrations are available?',
    answer:
      'We integrate with popular payroll, accounting, and communication tools. Enterprise plans get custom integration support.',
    category: 'Integrations',
  },
  {
    question: 'Do you have an API?',
    answer:
      'Yes. Our REST API is available on Growth and Enterprise plans with comprehensive documentation.',
    category: 'Integrations',
  },
  {
    question: 'What support do you offer?',
    answer:
      'Email support for Starter, priority support for Growth, and dedicated 24/7 support for Enterprise.',
    category: 'Support',
  },
  {
    question: 'Can I cancel my subscription?',
    answer:
      'Yes, cancel anytime with no penalties. You retain access until the end of your billing period.',
    category: 'Billing',
  },
];
