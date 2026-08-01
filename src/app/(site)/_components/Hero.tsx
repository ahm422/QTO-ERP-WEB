'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { QTO_DEV_URL } from '@/lib/constants';
import {
  getButtonTap,
  getFadeInUp,
  getStaggerContainer,
  getStaggerItem,
} from '@/lib/motion';
import HeroNodeDiagram from './HeroNodeDiagram';

const Hero = () => {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const fadeUp = getFadeInUp(reduced);
  const tap = getButtonTap(reduced);

  const benefits = [
    'Track time & attendance in real-time',
    'Manage your entire workforce lifecycle',
    'Deliver projects on time, every time',
  ];

  return (
    <section
      className='relative min-h-screen w-full overflow-hidden flex items-center'
      style={{ background: 'linear-gradient(316deg, #ffa500 0%, #ee7600 74%)' }}
    >
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute inset-0 bg-black/10' />

        {!reduced && (
          <>
            <motion.div
              className='absolute -top-1/4 -left-1/4 w-175 h-175 rounded-full'
              style={{
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)',
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className='absolute -bottom-1/4 -right-1/4 w-125 h-125 rounded-full'
              style={{
                background:
                  'radial-gradient(circle, rgba(0,0,0,0.15) 0%, transparent 60%)',
              }}
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        <div
          className='absolute inset-0 opacity-[0.05]'
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className='relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-16 lg:py-24'>
        <div className='max-w-7xl mx-auto'>
          <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'>
            <motion.div
              variants={container}
              initial='hidden'
              animate='visible'
              className='text-center lg:text-left'
            >
              <motion.div variants={item} className='mb-6'>
                <span className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 border border-white/20 text-white text-sm font-medium backdrop-blur-sm'>
                  <Sparkles className='w-4 h-4 text-[#EEB822]' />
                  The Modern ERP Platform
                </span>
              </motion.div>

              <motion.h1
                variants={item}
                className='text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg'
              >
                The Modern ERP for{' '}
                <span className='text-black drop-shadow-sm'>Growing Teams</span>
              </motion.h1>

              <motion.p
                variants={item}
                className='text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0'
              >
                Attendance, HR, and Project Management — unified in one powerful
                platform.
              </motion.p>

              <motion.ul
                variants={item}
                className='flex flex-col gap-3 mb-8 text-white/90 max-w-md mx-auto lg:mx-0'
              >
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className='flex items-center gap-3 text-sm sm:text-base'
                  >
                    <div className='w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0'>
                      <CheckCircle className='h-4 w-4 text-[#EEB822]' />
                    </div>
                    {benefit}
                  </li>
                ))}
              </motion.ul>

              <motion.div
                variants={item}
                className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6'
              >
                <motion.div whileTap={tap}>
                  <Link
                    href='/demo'
                    className='group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold text-lg shadow-xl shadow-black/20 hover:shadow-black/30 transition-[box-shadow,colors] duration-300'
                  >
                    Book a Demo
                    <ArrowRight className='w-5 h-5 transition-transform group-hover:translate-x-1' />
                  </Link>
                </motion.div>
                <motion.div whileTap={tap}>
                  <Link
                    href='/pricing'
                    className='group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-black/20 border border-white/30 text-white font-semibold text-lg hover:bg-black/30 hover:border-white/50 transition-all duration-300 backdrop-blur-sm'
                  >
                    See Pricing
                  </Link>
                </motion.div>
              </motion.div>

              <motion.a
                variants={item}
                href={QTO_DEV_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors'
              >
                A product by QTO Dev <ExternalLink className='h-4 w-4' />
              </motion.a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial='hidden'
              animate='visible'
              className='relative hidden lg:block'
            >
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='w-87.5 h-87.5 rounded-full bg-white/10 blur-3xl' />
              </div>

              <motion.div
                className='relative z-10'
                animate={reduced ? undefined : { y: [-6, 6, -6] }}
                transition={
                  reduced
                    ? undefined
                    : { duration: 6, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                <HeroNodeDiagram />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
