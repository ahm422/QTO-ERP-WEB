'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import type { BlogPostSummary } from '@/types/content';
import {
  getCardHover,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from '@/lib/motion';
import { Card } from '@/components/ui/card';
import { EyebrowBadge } from '@/components/ui/eyebrow-badge';

interface BlogPostsProps {
  posts: BlogPostSummary[];
}

export default function BlogPosts({ posts }: BlogPostsProps) {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const hover = getCardHover(reduced);

  return (
    <section className='section-padding bg-background'>
      <div className='container-main max-w-3xl'>
        <motion.div
          className='space-y-6'
          variants={container}
          initial='hidden'
          whileInView='visible'
          viewport={viewportOnce}
        >
          {posts.map((post) => (
            <motion.div key={post.slug} variants={item} whileHover={hover}>
              <Link href={`/blog/${post.slug}`} className='block'>
                <Card variant='interactive' radius='lg' padding='md'>
                  <EyebrowBadge
                    label={post.category}
                    variant='accent'
                    className='mb-3'
                  />
                  <h3 className='font-display text-lg font-bold leading-snug text-foreground'>
                    {post.title}
                  </h3>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
