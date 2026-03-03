'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SolutionsCTA() {
  return (
    <section className='py-16 md:py-24 bg-linear-to-b from-white to-accent/10'>
      <div className='container-main px-4'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className='max-w-3xl mx-auto text-center'
        >
          {/* Heading */}
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight'>
            Ready to get started?
          </h2>

          {/* Description */}
          <p className='text-lg text-gray-600 mb-10 leading-relaxed'>
            Experience the full power of QTO-ERP with a personalized
            walkthrough. Our team will show you how to solve your biggest
            operational challenges.
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className='flex flex-col sm:flex-row gap-3 justify-center mb-12'
          >
            <Link
              href='/demo'
              // className='group inline-flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all hover:scale-105'
            >
              <Button size={'lg'}>
              Schedule Demo
              <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
              </Button>
            </Link>

            <Link
              href='/pricing'
              // className='inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-all'
            >
              <Button size={'lg'} variant={'secondary'}>View Plans</Button>
            </Link>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className='grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-600'
          >
            <div className='flex flex-col items-center gap-2'>
              <CheckCircle2 className='w-5 h-5 text-accent' />
              <span>Free for 14 days</span>
            </div>
            <div className='flex flex-col items-center gap-2'>
              <CheckCircle2 className='w-5 h-5 text-accent' />
              <span>No credit card needed</span>
            </div>
            <div className='flex flex-col items-center gap-2'>
              <CheckCircle2 className='w-5 h-5 text-accent' />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
