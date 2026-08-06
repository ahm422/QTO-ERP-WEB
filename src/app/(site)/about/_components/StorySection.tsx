'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink, Lightbulb, BookOpen } from 'lucide-react';
import { QTO_DEV_URL } from '@/lib/constants';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { Card } from '@/components/ui/card';
import { getFadeInUp, viewportOnce } from '@/lib/motion';

export default function StorySection() {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);

  return (
    <section className='section-padding bg-muted/30'>
      <div className='container-main'>
        <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'>
          <motion.div
            variants={fadeUp}
            initial='hidden'
            whileInView='visible'
            viewport={viewportOnce}
            className='group relative order-2 aspect-square overflow-hidden rounded-2xl border border-border shadow-[var(--card-shadow)] lg:order-1 lg:aspect-auto lg:h-[600px]'
          >
            <div className='pointer-events-none absolute inset-0 z-10 bg-primary/10 transition-colors duration-500 group-hover:bg-primary/0' />
            <Image
              src='https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop'
              alt='Our Story Illustration'
              fill
              className='object-cover'
              sizes='(max-width: 1024px) 100vw, 50vw'
            />
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial='hidden'
            whileInView='visible'
            viewport={viewportOnce}
            className='order-1 space-y-8 lg:order-2'
          >
            <div>
              <div className='mb-3'>
                <EyebrowBadge
                  icon={BookOpen}
                  label='Our Story'
                  variant='accent'
                />
              </div>
              <h2 className='mb-6 font-display text-3xl font-bold text-foreground md:text-4xl'>
                Why We Built QTO-ERP
              </h2>

              <div className='space-y-6 text-lg leading-relaxed text-muted-foreground'>
                <p>
                  We started QTO-ERP because we saw teams struggling with
                  disconnected tools for attendance, HR, and project management.
                  Spreadsheets, siloed apps, and manual processes were holding
                  businesses back from their true potential.
                </p>
                <p>
                  Our mission is simple: to give growing teams one powerful,
                  intuitive platform that handles operational complexity
                  flawlessly, so they can focus entirely on what matters —
                  building great products and serving their customers.
                </p>

                <Card
                  variant='interactive'
                  radius='lg'
                  padding='md'
                  className='mt-8'
                >
                  <h4 className='mb-2 flex items-center gap-2 font-semibold text-foreground'>
                    <span className='flex size-8 items-center justify-center rounded-full bg-accent/10 text-accent'>
                      <Lightbulb className='size-4' />
                    </span>
                    A Product of Passion
                  </h4>
                  <p className='text-base text-muted-foreground'>
                    QTO-ERP is proudly built by{' '}
                    <a
                      href={QTO_DEV_URL}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-1 font-semibold text-accent transition-colors hover:underline'
                    >
                      QTO Dev <ExternalLink className='size-4' />
                    </a>
                    , a dedicated team passionate about creating tools that
                    fundamentally make the future of work better.
                  </p>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
