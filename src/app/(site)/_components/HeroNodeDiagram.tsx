'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { getStaggerContainer, getStaggerItem } from '@/lib/motion';

type NodeDef = {
  id: string;
  label: string;
  x: number;
  y: number;
};

/** Module flow: Accounting → HR / Inventory / CRM → Payroll → Mfg */
const NODES: NodeDef[] = [
  { id: 'accounting', label: 'Accounting', x: 60, y: 160 },
  { id: 'hr', label: 'HR', x: 220, y: 70 },
  { id: 'inventory', label: 'Inventory', x: 220, y: 160 },
  { id: 'crm', label: 'CRM', x: 220, y: 250 },
  { id: 'payroll', label: 'Payroll', x: 380, y: 160 },
  { id: 'mfg', label: 'Mfg', x: 520, y: 160 },
];

const EDGES: [string, string][] = [
  ['accounting', 'hr'],
  ['accounting', 'inventory'],
  ['accounting', 'crm'],
  ['hr', 'payroll'],
  ['inventory', 'payroll'],
  ['crm', 'payroll'],
  ['payroll', 'mfg'],
];

function nodeById(id: string) {
  return NODES.find((n) => n.id === id)!;
}

function PulsingDot({
  x1,
  y1,
  x2,
  y2,
  delay,
  reduced,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
  reduced: boolean | null;
}) {
  if (reduced) {
    return (
      <circle
        cx={(x1 + x2) / 2}
        cy={(y1 + y2) / 2}
        r={3}
        fill='var(--hero-accent)'
        fillOpacity={0.55}
      />
    );
  }

  return (
    <motion.circle
      r={3.5}
      fill='var(--hero-accent)'
      filter='url(#nodeGlow)'
      initial={{ opacity: 0.3 }}
      animate={{
        cx: [x1, x2],
        cy: [y1, y2],
        opacity: [0.2, 1, 0.2],
      }}
      transition={{
        duration: 2.4,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function HeroNodeDiagram() {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);

  return (
    <div
      className='relative aspect-[580/320] w-full overflow-hidden rounded-2xl border border-hero-chip-border bg-hero-chip text-hero-foreground shadow-2xl shadow-black/10 backdrop-blur-xl'
      aria-hidden='true'
    >
      <svg
        viewBox='0 0 580 320'
        className='h-full w-full'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <defs>
          <linearGradient id='nodeEdge' x1='0%' y1='0%' x2='100%' y2='0%'>
            <stop offset='0%' stopColor='currentColor' stopOpacity='0.15' />
            <stop
              offset='50%'
              stopColor='var(--hero-accent)'
              stopOpacity='0.55'
            />
            <stop offset='100%' stopColor='currentColor' stopOpacity='0.15' />
          </linearGradient>
          <linearGradient id='nodeFill' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop
              offset='0%'
              stopColor='var(--hero-accent)'
              stopOpacity='0.35'
            />
            <stop offset='100%' stopColor='var(--accent-dark)' stopOpacity='0.25' />
          </linearGradient>
          <filter id='nodeGlow'>
            <feGaussianBlur stdDeviation='2' result='blur' />
            <feMerge>
              <feMergeNode in='blur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
        </defs>

        <pattern
          id='nodeGrid'
          width='24'
          height='24'
          patternUnits='userSpaceOnUse'
        >
          <circle cx='1' cy='1' r='0.8' fill='currentColor' fillOpacity='0.12' />
        </pattern>
        <rect width='580' height='320' fill='url(#nodeGrid)' opacity='0.5' />

        {EDGES.map(([from, to], i) => {
          const a = nodeById(from);
          const b = nodeById(to);
          return (
            <g key={`${from}-${to}`}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke='url(#nodeEdge)'
                strokeWidth='1.5'
              />
              <PulsingDot
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                delay={i * 0.28}
                reduced={reduced}
              />
            </g>
          );
        })}

        <motion.g
          variants={container}
          initial='hidden'
          animate='visible'
        >
          {NODES.map((node) => (
            <motion.g
              key={node.id}
              variants={item}
              style={{ originX: `${node.x}px`, originY: `${node.y}px` }}
            >
              <rect
                x={node.x - 52}
                y={node.y - 22}
                width={104}
                height={44}
                rx={12}
                fill='url(#nodeFill)'
                stroke='currentColor'
                strokeOpacity='0.35'
                strokeWidth='1.5'
              />
              {!reduced && (
                <motion.rect
                  x={node.x - 52}
                  y={node.y - 22}
                  width={104}
                  height={44}
                  rx={12}
                  fill='none'
                  stroke='var(--hero-accent)'
                  strokeOpacity='0.55'
                  strokeWidth='1'
                  animate={{ opacity: [0.25, 0.7, 0.25] }}
                  transition={{
                    duration: 3,
                    delay: NODES.indexOf(node) * 0.35,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor='middle'
                fill='currentColor'
                fontSize='13'
                fontWeight='600'
                className='font-sans'
              >
                {node.label}
              </text>
            </motion.g>
          ))}
        </motion.g>
      </svg>
    </div>
  );
}
