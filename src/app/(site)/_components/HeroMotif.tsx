'use client';

import { motion, useReducedMotion } from 'framer-motion';

export type HeroMotif = 'waves' | 'leaves' | 'rays' | 'petals' | 'grid';

type HeroMotifBackdropProps = {
  motif: HeroMotif;
};

/**
 * Full-bleed atmosphere for the home hero.
 * Distinct shapes per motif — not just faint glow blobs.
 * Orange brand lock-in pins the home hero to "rays".
 */
export function HeroMotifBackdrop({ motif }: HeroMotifBackdropProps) {
  const reduced = useReducedMotion();

  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden' aria-hidden>
      {/* Shared accent wash — always visible */}
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_15%_20%,var(--hero-glow),transparent_55%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_90%_80%,var(--hero-glow-alt),transparent_50%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_70%_15%,color-mix(in_oklab,var(--hero-accent)_18%,transparent),transparent_60%)]' />

      {motif === 'waves' && <WavesLayer reduced={!!reduced} />}
      {motif === 'leaves' && <LeavesLayer reduced={!!reduced} />}
      {motif === 'rays' && <RaysLayer reduced={!!reduced} />}
      {motif === 'petals' && <PetalsLayer reduced={!!reduced} />}
      {motif === 'grid' && <GridLayer reduced={!!reduced} />}
    </div>
  );
}

function WavesLayer({ reduced }: { reduced: boolean }) {
  return (
    <svg
      className='absolute inset-0 h-full w-full text-hero-accent'
      viewBox='0 0 1440 800'
      preserveAspectRatio='xMidYMid slice'
      fill='none'
    >
      <defs>
        <linearGradient id='heroWaveA' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.35' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0.05' />
        </linearGradient>
        <linearGradient id='heroWaveB' x1='0' y1='1' x2='1' y2='0'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='0.22' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0.02' />
        </linearGradient>
      </defs>

      <motion.path
        d='M0 520 C 240 440, 420 620, 720 520 S 1200 400, 1440 500 L1440 800 L0 800 Z'
        fill='url(#heroWaveA)'
        animate={
          reduced
            ? undefined
            : {
                d: [
                  'M0 520 C 240 440, 420 620, 720 520 S 1200 400, 1440 500 L1440 800 L0 800 Z',
                  'M0 540 C 260 600, 440 460, 740 540 S 1180 620, 1440 480 L1440 800 L0 800 Z',
                  'M0 520 C 240 440, 420 620, 720 520 S 1200 400, 1440 500 L1440 800 L0 800 Z',
                ],
              }
        }
        transition={
          reduced
            ? undefined
            : { duration: 14, repeat: Infinity, ease: 'easeInOut' }
        }
      />
      <motion.path
        d='M0 600 C 280 540, 480 680, 780 600 S 1160 520, 1440 590 L1440 800 L0 800 Z'
        fill='url(#heroWaveB)'
        animate={
          reduced
            ? undefined
            : {
                d: [
                  'M0 600 C 280 540, 480 680, 780 600 S 1160 520, 1440 590 L1440 800 L0 800 Z',
                  'M0 580 C 300 640, 500 540, 800 600 S 1140 660, 1440 560 L1440 800 L0 800 Z',
                  'M0 600 C 280 540, 480 680, 780 600 S 1160 520, 1440 590 L1440 800 L0 800 Z',
                ],
              }
        }
        transition={
          reduced
            ? undefined
            : { duration: 11, repeat: Infinity, ease: 'easeInOut' }
        }
      />

      {[120, 280, 440].map((y, i) => (
        <motion.path
          key={y}
          d={`M-40 ${y} C 200 ${y - 40}, 400 ${y + 50}, 700 ${y} S 1100 ${y - 30}, 1480 ${y + 10}`}
          stroke='currentColor'
          strokeWidth={1.5}
          strokeOpacity={0.28 - i * 0.06}
          fill='none'
          animate={
            reduced
              ? undefined
              : { x: [0, 30, 0], opacity: [0.2, 0.4, 0.2] }
          }
          transition={
            reduced
              ? undefined
              : {
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        />
      ))}
    </svg>
  );
}

function LeavesLayer({ reduced }: { reduced: boolean }) {
  const blobs = [
    { cx: 180, cy: 160, rx: 140, ry: 90, rot: -25, op: 0.2 },
    { cx: 1180, cy: 200, rx: 160, ry: 100, rot: 20, op: 0.18 },
    { cx: 980, cy: 620, rx: 180, ry: 110, rot: -10, op: 0.22 },
    { cx: 320, cy: 580, rx: 120, ry: 80, rot: 30, op: 0.16 },
    { cx: 720, cy: 120, rx: 90, ry: 60, rot: -5, op: 0.14 },
  ];

  return (
    <svg
      className='absolute inset-0 h-full w-full text-hero-accent'
      viewBox='0 0 1440 800'
      preserveAspectRatio='xMidYMid slice'
      fill='none'
    >
      {blobs.map((b, i) => (
        <motion.ellipse
          key={i}
          cx={b.cx}
          cy={b.cy}
          rx={b.rx}
          ry={b.ry}
          fill='currentColor'
          fillOpacity={b.op}
          transform={`rotate(${b.rot} ${b.cx} ${b.cy})`}
          animate={
            reduced
              ? undefined
              : {
                  scale: [1, 1.08, 1],
                  opacity: [b.op, b.op + 0.08, b.op],
                }
          }
          transition={
            reduced
              ? undefined
              : {
                  duration: 10 + i,
                  delay: i * 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
          style={{ transformOrigin: `${b.cx}px ${b.cy}px` }}
        />
      ))}
      {/* Leaf silhouettes */}
      {[
        { x: 200, y: 280, s: 1.2, r: -30 },
        { x: 1100, y: 420, s: 1.4, r: 25 },
        { x: 600, y: 650, s: 1, r: -15 },
        { x: 1280, y: 140, s: 0.9, r: 40 },
      ].map((leaf, i) => (
        <motion.g
          key={`leaf-${i}`}
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r}) scale(${leaf.s})`}
          animate={
            reduced
              ? undefined
              : { y: [0, -12, 0], rotate: [leaf.r - 4, leaf.r + 4, leaf.r - 4] }
          }
          transition={
            reduced
              ? undefined
              : { duration: 9 + i, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <ellipse
            cx={0}
            cy={0}
            rx={28}
            ry={52}
            fill='currentColor'
            fillOpacity={0.28}
          />
          <path
            d='M0 -48 Q 8 0 0 48'
            stroke='currentColor'
            strokeOpacity={0.45}
            strokeWidth={1.5}
          />
        </motion.g>
      ))}
    </svg>
  );
}

function RaysLayer({ reduced }: { reduced: boolean }) {
  const rays = Array.from({ length: 18 }, (_, i) => i * (360 / 18));

  return (
    <div className='absolute inset-0 text-hero-accent'>
      <motion.div
        className='absolute left-1/2 top-[-10%] size-[min(90vw,720px)] -translate-x-1/2'
        animate={reduced ? undefined : { rotate: [0, 360] }}
        transition={
          reduced
            ? undefined
            : { duration: 80, repeat: Infinity, ease: 'linear' }
        }
      >
        <svg viewBox='0 0 400 400' className='h-full w-full'>
          <defs>
            <radialGradient id='heroRayCore' cx='50%' cy='50%' r='50%'>
              <stop offset='0%' stopColor='currentColor' stopOpacity='0.45' />
              <stop offset='55%' stopColor='currentColor' stopOpacity='0.12' />
              <stop offset='100%' stopColor='currentColor' stopOpacity='0' />
            </radialGradient>
            <linearGradient id='heroRayBeam' x1='0.5' y1='0' x2='0.5' y2='1'>
              <stop offset='0%' stopColor='currentColor' stopOpacity='0.5' />
              <stop offset='100%' stopColor='currentColor' stopOpacity='0' />
            </linearGradient>
          </defs>
          <circle cx='200' cy='200' r='160' fill='url(#heroRayCore)' />
          {rays.map((angle) => (
            <g key={angle} transform={`rotate(${angle} 200 200)`}>
              <path
                d='M 194 200 L 200 20 L 206 200 Z'
                fill='url(#heroRayBeam)'
                opacity={0.55}
              />
            </g>
          ))}
        </svg>
      </motion.div>
      <div className='absolute bottom-0 right-0 size-[28rem] translate-x-1/4 translate-y-1/4 rounded-full bg-hero-glow-alt opacity-50 blur-3xl' />
    </div>
  );
}

function PetalsLayer({ reduced }: { reduced: boolean }) {
  const petals = [
    { x: '8%', y: '18%', s: 1.1, d: 0 },
    { x: '22%', y: '55%', s: 0.8, d: 0.6 },
    { x: '75%', y: '22%', s: 1.3, d: 1.1 },
    { x: '88%', y: '60%', s: 0.9, d: 0.3 },
    { x: '55%', y: '12%', s: 0.7, d: 1.5 },
    { x: '40%', y: '70%', s: 1, d: 0.9 },
    { x: '12%', y: '78%', s: 0.75, d: 1.8 },
    { x: '68%', y: '75%', s: 1.15, d: 0.4 },
  ];

  return (
    <div className='absolute inset-0 text-hero-accent'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,color-mix(in_oklab,var(--hero-accent)_20%,transparent),transparent_45%)]' />
      {petals.map((p, i) => (
        <motion.div
          key={i}
          className='absolute'
          style={{
            left: p.x,
            top: p.y,
            width: `${72 * p.s}px`,
            height: `${72 * p.s}px`,
          }}
          animate={
            reduced
              ? undefined
              : {
                  y: [0, -16, 0],
                  rotate: [0, 12, 0],
                  opacity: [0.35, 0.7, 0.35],
                }
          }
          transition={
            reduced
              ? undefined
              : {
                  duration: 6 + i * 0.4,
                  delay: p.d,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        >
          <svg viewBox='0 0 64 64' className='h-full w-full'>
            <ellipse
              cx='28'
              cy='32'
              rx='14'
              ry='22'
              fill='currentColor'
              fillOpacity='0.35'
              transform='rotate(-25 28 32)'
            />
            <ellipse
              cx='38'
              cy='34'
              rx='12'
              ry='20'
              fill='currentColor'
              fillOpacity='0.28'
              transform='rotate(20 38 34)'
            />
            <circle cx='32' cy='34' r='5' fill='currentColor' fillOpacity='0.55' />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

function GridLayer({ reduced }: { reduced: boolean }) {
  return (
    <div className='absolute inset-0 text-hero-accent'>
      {/* Perspective grid floor */}
      <div
        className='absolute inset-x-[-20%] bottom-0 h-[55%] opacity-40'
        style={{
          backgroundImage: `
            linear-gradient(to right, color-mix(in oklab, var(--hero-accent) 35%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in oklab, var(--hero-accent) 35%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          transform: 'perspective(600px) rotateX(58deg)',
          transformOrigin: 'center bottom',
          maskImage:
            'linear-gradient(to top, black 10%, transparent 90%)',
          WebkitMaskImage:
            'linear-gradient(to top, black 10%, transparent 90%)',
        }}
      />
      {/* Node constellation accents */}
      <svg
        className='absolute inset-0 h-full w-full'
        viewBox='0 0 1440 800'
        preserveAspectRatio='xMidYMid slice'
      >
        {[
          [220, 180],
          [480, 260],
          [360, 400],
          [1100, 200],
          [1280, 340],
          [980, 480],
          [700, 160],
        ].map(([x, y], i) => (
          <g key={i}>
            <motion.circle
              cx={x}
              cy={y}
              r={4}
              fill='currentColor'
              fillOpacity={0.55}
              animate={
                reduced
                  ? undefined
                  : { opacity: [0.35, 0.85, 0.35], r: [3.5, 5, 3.5] }
              }
              transition={
                reduced
                  ? undefined
                  : {
                      duration: 3.5 + i * 0.3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
              }
            />
            {i < 6 && (
              <line
                x1={x}
                y1={y}
                x2={[480, 360, 700, 1280, 980, 700][i]}
                y2={[260, 400, 160, 340, 480, 160][i]}
                stroke='currentColor'
                strokeOpacity={0.18}
                strokeWidth={1}
              />
            )}
          </g>
        ))}
      </svg>
      <div className='absolute left-[10%] top-[15%] size-[22rem] rounded-full bg-hero-glow opacity-60 blur-3xl' />
      <div className='absolute bottom-[10%] right-[8%] size-[18rem] rounded-full bg-hero-glow-alt opacity-50 blur-3xl' />
    </div>
  );
}
