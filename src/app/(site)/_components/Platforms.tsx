'use client';

import { HeaderSections } from '@/components/ui/HeaderSections';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { getModuleIcon } from '@/lib/icon-map';
import {
  getCardHover,
  getIconChipHover,
  getPanelSwap,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from '@/lib/motion';
import type { ModuleSummary } from '@/types/content';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle, Play, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type PlatformsProps = {
  modules: ModuleSummary[];
};

const Platforms = ({ modules }: PlatformsProps) => {
  const [hoveredApp, setHoveredApp] = useState<number | null>(null);
  const [imageOpen, setImageOpen] = useState(false);
  const [activeImageSlug, setActiveImageSlug] = useState('');
  const activeModule = modules.find((app) => app.slug === activeImageSlug);
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const hover = getCardHover(reduced);
  const chipHover = getIconChipHover(reduced);
  const panel = getPanelSwap(reduced);

  return (
    <>
      <section className='section-padding'>
        <div className='container-main'>
          <HeaderSections
            tag='Platform'
            title='Everything You Need, In One Suite'
            description='Powerful modules designed to work together seamlessly. Hover to preview.'
          />
          <motion.div
            className='grid gap-6 md:grid-cols-3'
            variants={container}
            initial='hidden'
            whileInView='visible'
            viewport={viewportOnce}
          >
            {modules.map((app, i) => {
              const Icon = getModuleIcon(app.iconKey);
              return (
                <motion.div
                  key={app.slug}
                  variants={item}
                  whileHover={hover}
                  onMouseEnter={() => setHoveredApp(i)}
                  onMouseLeave={() => setHoveredApp(null)}
                >
                  <Card variant='interactive' radius='lg' padding='md' className='h-full'>
                    <motion.div
                      className='mb-4 inline-flex'
                      whileHover={chipHover}
                    >
                      <Icon className='size-10 text-accent' />
                    </motion.div>
                    <CardTitle className='mb-2 text-xl'>{app.name}</CardTitle>
                    <CardDescription className='mb-4 leading-relaxed'>
                      {app.shortDescription}
                    </CardDescription>

                    <motion.div
                      initial={false}
                      animate={{
                        height: hoveredApp === i ? 'auto' : 0,
                        opacity: hoveredApp === i ? 1 : 0,
                      }}
                      transition={{ duration: reduced ? 0 : 0.3 }}
                      className='overflow-hidden'
                    >
                      <div
                        className='group relative mb-4 flex aspect-video cursor-pointer items-center justify-center rounded-xl bg-muted'
                        onClick={() => {
                          setActiveImageSlug(app.slug);
                          setImageOpen(true);
                        }}
                      >
                        <div className='absolute inset-0 flex items-center justify-center rounded-xl bg-foreground/5 transition-colors group-hover:bg-foreground/10'>
                          <div className='flex size-12 items-center justify-center rounded-full bg-accent/90 shadow-lg'>
                            <Play className='ml-0.5 size-5 text-accent-foreground' />
                          </div>
                        </div>
                        <span className='text-xs text-muted-foreground'>
                          View {app.name} Overview
                        </span>
                      </div>
                      <ul className='mb-4 space-y-1.5'>
                        {app.highlights.map((h) => (
                          <li
                            key={h}
                            className='flex items-center gap-2 text-xs text-muted-foreground'
                          >
                            <CheckCircle className='size-3 shrink-0 text-accent' />
                            {h}
                          </li>
                        ))}
                      </ul>
                      <p className='mb-3 text-xs font-medium text-accent'>
                        Best for: {app.bestFor}
                      </p>
                    </motion.div>

                    <Link
                      href={`/erp/${app.slug}`}
                      className='flex items-center gap-1 text-sm font-medium text-accent'
                    >
                      Learn more <ArrowRight className='size-3.5' />
                    </Link>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {imageOpen && (
          <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
            onClick={() => setImageOpen(false)}
          >
            <motion.div
              variants={panel}
              initial='initial'
              animate='animate'
              exit='exit'
              onClick={(e) => e.stopPropagation()}
              className='max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl border border-border bg-card'
            >
              <div className='p-6'>
                <div className='mb-4 flex items-center justify-between'>
                  <h3 className='font-display text-2xl font-bold text-foreground'>
                    {activeModule?.name} Overview
                  </h3>
                  <button
                    type='button'
                    onClick={() => setImageOpen(false)}
                    className='p-1 text-muted-foreground transition-colors hover:text-foreground'
                    aria-label='Close preview'
                  >
                    <X className='size-6' />
                  </button>
                </div>
                <div className='w-full overflow-hidden rounded-xl bg-muted'>
                  {activeModule?.image ? (
                    <img
                      src={activeModule.image}
                      alt={activeModule.name}
                      className='h-auto w-full'
                    />
                  ) : (
                    <div className='flex aspect-video items-center justify-center bg-muted'>
                      <p className='text-muted-foreground'>
                        Image not available yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Platforms;
