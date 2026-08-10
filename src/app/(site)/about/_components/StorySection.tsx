'use client';

import { createElement } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { ExternalLink, BookOpen } from 'lucide-react';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import { Card } from '@/components/ui/card';
import { getAboutIcon } from '@/lib/icon-map';
import { getFadeInUp, viewportOnce } from '@/lib/motion';
import type { AboutStory } from '@/types/content';

type StorySectionProps = {
  story: AboutStory;
};

function CalloutBody({
  body,
  linkLabel,
  linkUrl,
}: {
  body: string;
  linkLabel: string;
  linkUrl: string;
}) {
  const link = (
    <a
      href={linkUrl}
      target='_blank'
      rel='noopener noreferrer'
      className='inline-flex items-center gap-1 font-semibold text-accent transition-colors hover:underline'
    >
      {linkLabel} <ExternalLink className='size-4' />
    </a>
  );

  const parts = body.split('{link}');
  if (parts.length === 1) {
    return (
      <p className='text-base text-muted-foreground'>
        {body} {link}
      </p>
    );
  }

  return (
    <p className='text-base text-muted-foreground'>
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 ? link : null}
        </span>
      ))}
    </p>
  );
}

export default function StorySection({ story }: StorySectionProps) {
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
              src={story.imageUrl}
              alt={story.imageAlt}
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
                  label={story.badge}
                  variant='accent'
                />
              </div>
              <h2 className='mb-6 font-display text-3xl font-bold text-foreground md:text-4xl'>
                {story.title}
              </h2>

              <div className='space-y-6 text-lg leading-relaxed text-muted-foreground'>
                <p>{story.paragraph1}</p>
                <p>{story.paragraph2}</p>

                <Card
                  variant='interactive'
                  radius='lg'
                  padding='md'
                  className='mt-8'
                >
                  <h4 className='mb-2 flex items-center gap-2 font-semibold text-foreground'>
                    <span className='flex size-8 items-center justify-center rounded-full bg-accent/10 text-accent'>
                      {createElement(getAboutIcon(story.callout.iconKey), {
                        className: 'size-4',
                      })}
                    </span>
                    {story.callout.title}
                  </h4>
                  <CalloutBody
                    body={story.callout.body}
                    linkLabel={story.callout.linkLabel}
                    linkUrl={story.callout.linkUrl}
                  />
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
