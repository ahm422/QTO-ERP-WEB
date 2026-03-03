'use client';
import { motion } from 'framer-motion';
import { Card, CardContent } from './card';

interface HeaderSectionsProps {
  tag?: string;
  title: string;
  description?: string;
  centered?: boolean;
}

export function HeaderSections({
  tag,
  title,
  description,
  centered = true,
}: HeaderSectionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className={`mb-12 ${centered ? 'text-center' : ''}`}
    >
      {tag && (
        <>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='inline-block text-md  uppercase tracking-widest text-accent mb-3 font-bold'
          >
            {tag}
          </motion.p>
        </>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='text-3xl md:text-4xl font-bold text-foreground mb-4'
      >
        {title}
      </motion.h2>
      {description && (
        <p className='text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
          {description}
        </p>
      )}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          width: 60,
          height: 3,
          background: 'linear-gradient(90deg, #f2b60f, #d89f03)',
          margin: '16px auto 0',
          borderRadius: 2,
        }}
      />
    </motion.div>
  );
}
