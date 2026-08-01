'use client';

import { HeaderSections } from '@/components/ui/HeaderSections';
import { getModuleIcon } from '@/lib/icon-map';
import {
  getCardHover,
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

  return (
    <>
      <section className='section-padding'>
        <div className='container-main'>
          <HeaderSections
            tag='Platform'
            title='Everything You Need, In One Suite'
            description='Three powerful modules designed to work together seamlessly. Hover to preview.'
          />
          <motion.div
            className='grid md:grid-cols-3 gap-6'
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
                  <div className='block rounded-2xl border border-border bg-card p-6 card-elevated transition-[border-color,box-shadow] duration-300 hover:border-accent/40'>
                    <motion.div
                      className='mb-4 inline-flex'
                      whileHover={reduced ? undefined : { scale: 1.08 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <Icon className='h-10 w-10 text-accent' />
                    </motion.div>
                    <h3 className='text-xl font-bold text-foreground mb-2'>
                      {app.name}
                    </h3>
                    <p className='text-sm text-muted-foreground mb-4 leading-relaxed'>
                      {app.shortDescription}
                    </p>

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
                        className='mb-4 rounded-xl bg-muted aspect-video flex items-center justify-center relative group cursor-pointer'
                        onClick={() => {
                          setActiveImageSlug(app.slug);
                          setImageOpen(true);
                        }}
                      >
                        <div className='absolute inset-0 bg-foreground/5 rounded-xl flex items-center justify-center group-hover:bg-foreground/10 transition-colors'>
                          <div className='h-12 w-12 rounded-full bg-accent/90 flex items-center justify-center shadow-lg'>
                            <Play className='h-5 w-5 text-accent-foreground ml-0.5' />
                          </div>
                        </div>
                        <span className='text-xs text-muted-foreground'>
                          View {app.name} Overview
                        </span>
                      </div>
                      <ul className='space-y-1.5 mb-4'>
                        {app.highlights.map((h) => (
                          <li
                            key={h}
                            className='text-xs text-muted-foreground flex items-center gap-2'
                          >
                            <CheckCircle className='h-3 w-3 text-accent shrink-0' />
                            {h}
                          </li>
                        ))}
                      </ul>
                      <p className='text-xs text-accent font-medium mb-3'>
                        Best for: {app.bestFor}
                      </p>
                    </motion.div>

                    <Link
                      href={`/erp/${app.slug}`}
                      className='text-sm font-medium text-accent flex items-center gap-1'
                    >
                      Learn more <ArrowRight className='h-3.5 w-3.5' />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {imageOpen && (
          <div
            className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'
            onClick={() => setImageOpen(false)}
          >
            <motion.div
              initial={reduced ? { opacity: 1 } : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
              transition={{ duration: reduced ? 0.01 : 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className='bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto'
            >
              <div className='p-6'>
                <div className='flex justify-between items-center mb-4'>
                  <h3 className='text-2xl font-bold text-foreground'>
                    {activeModule?.name} Overview
                  </h3>
                  <button
                    type='button'
                    onClick={() => setImageOpen(false)}
                    className='text-muted-foreground hover:text-foreground transition-colors p-1'
                    aria-label='Close preview'
                  >
                    <X className='w-6 h-6' />
                  </button>
                </div>
                <div className='w-full bg-muted rounded-xl overflow-hidden'>
                  {activeModule?.image ? (
                    <img
                      src={activeModule.image}
                      alt={activeModule.name}
                      className='w-full h-auto'
                    />
                  ) : (
                    <div className='aspect-video flex items-center justify-center bg-gradient-to-br from-muted to-muted/50'>
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
