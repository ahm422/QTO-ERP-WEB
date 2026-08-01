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

interface BlogPostsProps {
  posts: BlogPostSummary[];
}

export default function BlogPosts({ posts }: BlogPostsProps) {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const hover = getCardHover(reduced);

  return (
    <section className='section-padding'>
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
              <Link
                href={`/blog/${post.slug}`}
                className='block rounded-2xl border border-border bg-card p-6 card-elevated hover:border-accent/40 transition-colors'
              >
                <span className='text-xs font-semibold text-accent uppercase'>
                  {post.category}
                </span>
                <h3 className='text-lg font-bold text-foreground mt-1 mb-1'>
                  {post.title}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
