'use client';
import { motion } from 'framer-motion';

interface BlogPost {
  title: string;
  category: string;
  date: string;
}

interface BlogPostsProps {
  posts: BlogPost[];
}

export default function BlogPosts({ posts }: BlogPostsProps) {
  return (
    <section className='section-padding'>
      <div className='container-main max-w-3xl'>
        <div className='space-y-6'>
          {posts.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className='rounded-2xl border border-border bg-card p-6 card-elevated'
            >
              <span className='text-xs font-semibold text-accent uppercase'>
                {post.category}
              </span>
              <h3 className='text-lg font-bold text-foreground mt-1 mb-1'>
                {post.title}
              </h3>
              <p className='text-sm text-muted-foreground'>{post.date}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
