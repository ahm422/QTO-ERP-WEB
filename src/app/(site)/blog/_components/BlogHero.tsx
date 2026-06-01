'use client';
import { motion } from 'framer-motion';

export default function BlogHero() {
  return (
    <section className='hero-gradient section-padding'>
      <div className='container-main text-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className='text-4xl md:text-5xl font-bold text-primary-foreground mb-4'>
            Blog
          </h1>
          <p className='text-lg text-primary-foreground/80'>
            Insights, guides, and best practices for modern teams.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
