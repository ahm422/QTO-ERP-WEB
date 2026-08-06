'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardIcon,
  CardTitle,
} from '@/components/ui/card';
import { HeaderSections } from '@/components/ui/HeaderSections';
import {
  getCardHover,
  getIconChipHover,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from '@/lib/motion';
import { motion, useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  Columns2,
  Search,
  type LucideIcon,
} from 'lucide-react';

type StepId = 'discover' | 'compare' | 'deploy';

type Step = {
  id: StepId;
  number: string;
  tag: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const STEPS: Step[] = [
  {
    id: 'discover',
    number: '01',
    tag: 'Discover',
    title: 'Smart Matching',
    description: 'Find modules that fit your stack with intelligent search and filters.',
    icon: Search,
  },
  {
    id: 'compare',
    number: '02',
    tag: 'Compare',
    title: 'Feature Matrix',
    description: 'Side-by-side fit scores so you can pick the right modules with confidence.',
    icon: Columns2,
  },
  {
    id: 'deploy',
    number: '03',
    tag: 'Deploy',
    title: 'Direct Connect',
    description: 'Go live with a confirmed connection — provision and start in minutes.',
    icon: CheckCircle2,
  },
];

const FILTER_CHIPS = ['Inventory', 'Finance', 'CRM', 'HR'];

const MATCH_ROWS = [
  { name: 'Inventory Pro', match: 98 },
  { name: 'Finance Suite', match: 91 },
  { name: 'CRM Hub', match: 84 },
];

function DiscoverPreview() {
  return (
    <div className='space-y-2.5'>
      <div className='flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2'>
        <Search className='size-3.5 shrink-0 text-muted-foreground' aria-hidden />
        <span className='truncate text-xs text-muted-foreground'>
          Search modules for your stack…
        </span>
      </div>
      <div className='flex flex-wrap gap-1.5'>
        {FILTER_CHIPS.map((chip) => (
          <Badge key={chip} variant='outline' className='text-[10px]'>
            {chip}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ComparePreview() {
  return (
    <ul className='space-y-2'>
      {MATCH_ROWS.map((row, i) => (
        <li
          key={row.name}
          className='flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5'
        >
          <span className='flex min-w-0 items-center gap-2'>
            <span className='font-mono text-[10px] text-muted-foreground'>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className='truncate text-xs font-medium text-foreground'>
              {row.name}
            </span>
          </span>
          <Badge variant='success' className='text-[10px]'>
            {row.match}%
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function DeployPreview() {
  return (
    <div className='flex items-start gap-3 rounded-lg border border-border bg-background px-3 py-2.5'>
      <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success'>
        <CheckCircle2 className='size-4' aria-hidden />
      </div>
      <div className='min-w-0 space-y-0.5'>
        <p className='text-xs font-medium text-foreground'>Connection confirmed</p>
        <p className='text-[10px] text-muted-foreground'>
          Inventory Pro · live in your workspace
        </p>
      </div>
    </div>
  );
}

function StepPreview({ id }: { id: StepId }) {
  return (
    <div
      className='pointer-events-none mt-auto rounded-xl border border-border bg-muted/30 p-3'
      aria-hidden='true'
    >
      {id === 'discover' && <DiscoverPreview />}
      {id === 'compare' && <ComparePreview />}
      {id === 'deploy' && <DeployPreview />}
    </div>
  );
}

export default function EvaluationWorkflow() {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const hover = getCardHover(reduced);
  const iconHover = getIconChipHover(reduced);

  return (
    <section className='section-padding'>
      <div className='container-main'>
        <HeaderSections
          tag='Evaluation Workflow'
          title='How ERPHub Works'
          description='Discover the right modules, compare fit scores, and deploy with a direct connection — three steps from shortlist to live.'
        />

        <div className='relative'>
          {/* Desktop connecting rail between cards */}
          <div
            className='pointer-events-none absolute top-10 right-[16.666%] left-[16.666%] z-0 hidden border-t border-dashed border-border md:block'
            aria-hidden='true'
          />

          <motion.div
            className='relative z-10 grid gap-6 md:grid-cols-3'
            variants={container}
            initial='hidden'
            whileInView='visible'
            viewport={viewportOnce}
          >
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  variants={item}
                  whileHover={hover}
                  className='h-full'
                >
                  <Card
                    variant='interactive'
                    radius='xl'
                    padding='md'
                    className='relative z-10 flex h-full cursor-default flex-col'
                  >
                    <div className='mb-4 flex items-start justify-between gap-3'>
                      <motion.div whileHover={iconHover} className='inline-flex'>
                        <CardIcon color='accent' size='md'>
                          <Icon className='size-5' aria-hidden />
                        </CardIcon>
                      </motion.div>
                      <span className='font-mono text-sm font-medium text-muted-foreground'>
                        {step.number}
                      </span>
                    </div>

                    <Badge variant='outline' className='mb-3 text-[10px] uppercase tracking-wide'>
                      {step.tag}
                    </Badge>

                    <CardTitle className='mb-2 font-display text-xl'>
                      {step.title}
                    </CardTitle>
                    <CardDescription className='mb-5 leading-relaxed'>
                      {step.description}
                    </CardDescription>

                    <StepPreview id={step.id} />
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
