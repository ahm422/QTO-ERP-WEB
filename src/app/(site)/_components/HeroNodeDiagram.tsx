'use client';

import { motion, useReducedMotion } from 'framer-motion';

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
        fill='rgba(255,255,255,0.55)'
      />
    );
  }

  return (
    <motion.circle
      r={3.5}
      fill='#EEB822'
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

  return (
    <div
      className='relative w-full aspect-[580/320] rounded-2xl border border-white/20 bg-black/20 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden'
      aria-hidden='true'
    >
      <svg
        viewBox='0 0 580 320'
        className='w-full h-full'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <defs>
          <linearGradient id='nodeEdge' x1='0%' y1='0%' x2='100%' y2='0%'>
            <stop offset='0%' stopColor='rgba(255,255,255,0.15)' />
            <stop offset='50%' stopColor='rgba(238,184,34,0.55)' />
            <stop offset='100%' stopColor='rgba(255,255,255,0.15)' />
          </linearGradient>
          <linearGradient id='nodeFill' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='rgba(255,165,0,0.35)' />
            <stop offset='100%' stopColor='rgba(238,118,0,0.25)' />
          </linearGradient>
          <filter id='nodeGlow'>
            <feGaussianBlur stdDeviation='2' result='blur' />
            <feMerge>
              <feMergeNode in='blur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
        </defs>

        {/* Soft grid */}
        <pattern
          id='nodeGrid'
          width='24'
          height='24'
          patternUnits='userSpaceOnUse'
        >
          <circle cx='1' cy='1' r='0.8' fill='rgba(255,255,255,0.12)' />
        </pattern>
        <rect width='580' height='320' fill='url(#nodeGrid)' opacity='0.5' />

        {/* Edges */}
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

        {/* Nodes */}
        {NODES.map((node, i) => (
          <motion.g
            key={node.id}
            initial={reduced ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.45, delay: 0.15 + i * 0.08 }
            }
            style={{ originX: `${node.x}px`, originY: `${node.y}px` }}
          >
            <rect
              x={node.x - 52}
              y={node.y - 22}
              width={104}
              height={44}
              rx={12}
              fill='url(#nodeFill)'
              stroke='rgba(255,255,255,0.35)'
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
                stroke='rgba(238,184,34,0.55)'
                strokeWidth='1'
                animate={{ opacity: [0.25, 0.7, 0.25] }}
                transition={{
                  duration: 3,
                  delay: i * 0.35,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            <text
              x={node.x}
              y={node.y + 5}
              textAnchor='middle'
              fill='white'
              fontSize='13'
              fontWeight='600'
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              {node.label}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
