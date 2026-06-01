'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { BlogPostSummary } from '@/types/content';

interface BlogPostsProps {
  posts: BlogPostSummary[];
}

export default function BlogPosts({ posts }: BlogPostsProps) {
  return (
    <section className='section-padding'>
      <div className='container-main max-w-3xl'>
        <div className='space-y-6'>
          {posts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
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
        </div>
      </div>
    </section>
  );
}
