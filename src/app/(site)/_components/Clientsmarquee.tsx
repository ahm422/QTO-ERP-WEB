'use client';

import { HeaderSections } from '@/components/ui/HeaderSections';
import { getFadeInUp, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';

type LogoItem = {
  name: string;
  color?: string;
  font?: string;
  sub?: string;
};

const row1: LogoItem[] = [
  { name: 'Nesma', color: '#1a3a2a' },
  { name: 'ibex.', color: '#e8003d', font: '900 italic' },
  { name: "Nando's", color: '#c8102e' },
  { name: 'deel.', color: '#1a1a2e', font: '700' },
  { name: 'Amreli Steels', color: '#555' },
  { name: 'KAPC', color: '#2e7d32' },
];

const row2: LogoItem[] = [
  { name: 'foodpanda', color: '#e8003d' },
  { name: 'COMSATS University', color: '#1a3a6e' },
  { name: 'ChenOne', color: '#1a237e', font: '700 italic' },
  { name: 'ZERO', color: '#e65100', sub: 'beyond wellness' },
  { name: 'Omar Hospital', color: '#0277bd', sub: '& Cardiac Centre' },
  { name: 'Interwood', color: '#2e7d32' },
];

const row3: LogoItem[] = [
  { name: 'PIA', color: '#006400' },
  { name: 'Chicken Tikka', color: '#c8102e' },
  { name: 'OPPO', color: '#111', font: '300' },
  { name: 'Mahmood Pharmacy', color: '#006400' },
  { name: 'Haier', color: '#003087', font: '300' },
  { name: 'Honda Ring Road', color: '#cc0000' },
  { name: 'AkzoNobel', color: '#1565c0' },
];

const LogoCard = ({ item }: { item: LogoItem }) => (
  <div
    className='mx-4 inline-flex h-20 min-w-40 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-3 shadow-[var(--card-shadow)] select-none'
  >
    <span
      className='leading-tight'
      style={{
        color: item.color || 'var(--foreground)',
        fontWeight: item.font ? Number(item.font.split(' ')[0]) || 700 : 700,
        fontStyle: item.font?.includes('italic') ? 'italic' : 'normal',
        fontSize: item.sub ? 18 : 22,
        letterSpacing: item.name === 'OPPO' ? 4 : 0,
        fontFamily:
          item.name === 'ibex.'
            ? 'Georgia, serif'
            : item.name === 'deel.'
              ? "'Arial Black', sans-serif"
              : item.name === 'Haier'
                ? 'Trebuchet MS, sans-serif'
                : 'inherit',
      }}
    >
      {item.name}
    </span>
    {item.sub ? (
      <span
        className='mt-0.5 text-[10px] tracking-wide opacity-75'
        style={{ color: item.color }}
      >
        {item.sub}
      </span>
    ) : null}
  </div>
);

const MarqueeRow = ({
  items,
  speed = 35,
  reverse = false,
  reduced,
}: {
  items: LogoItem[];
  speed?: number;
  reverse?: boolean;
  reduced: boolean | null;
}) => {
  const doubled = [...items, ...items, ...items];
  const totalWidth = items.length * 192;

  return (
    <div className='relative w-full overflow-hidden'>
      <div className='pointer-events-none absolute inset-y-0 left-0 z-2 w-20 bg-linear-to-r from-background to-transparent' />
      <div className='pointer-events-none absolute inset-y-0 right-0 z-2 w-20 bg-linear-to-l from-background to-transparent' />

      {reduced ? (
        <div className='flex flex-wrap justify-center gap-2 py-1'>
          {items.map((item) => (
            <LogoCard key={item.name} item={item} />
          ))}
        </div>
      ) : (
        <motion.div
          className='flex w-max'
          animate={{
            x: reverse ? [0, totalWidth] : [0, -totalWidth],
          }}
          transition={{
            duration: speed,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          {doubled.map((item, i) => (
            <LogoCard key={`${item.name}-${i}`} item={item} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default function ClientsMarquee() {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);

  return (
    <section className='py-18 font-sans'>
      <HeaderSections title='Trusted by industry leaders' tag='Customers' />

      <div className='flex flex-col gap-6'>
        {[
          { items: row1, speed: 30 },
          { items: row2, speed: 40 },
          { items: row3, speed: 25 },
        ].map((row, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            initial='hidden'
            whileInView='visible'
            viewport={viewportOnce}
            className={cn(reduced && 'opacity-100')}
          >
            <MarqueeRow items={row.items} speed={row.speed} reduced={reduced} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
