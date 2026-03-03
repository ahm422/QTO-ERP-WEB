'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from './button';
export function CTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Gradient Background */}
      <div 
        className="absolute inset-0"
      />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"
          animate={{ 
            x: [0, 100, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-black/10 blur-3xl"
          animate={{ 
            x: [0, -100, 0],
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto"
        >
          {/* Elevated Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ 
              y: -8,
              boxShadow: "0 40px 80px -20px rgba(0,0,0,0.3), 0 20px 30px -10px rgba(0,0,0,0.2)"
            }}
            className="relative bg-white rounded-3xl p-12 md:p-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 backdrop-blur-sm overflow-hidden"
          >
            {/* Subtle inner gradient */}
            
            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Single Line Headline */}
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-10 leading-tight"
              >
                Ready to Transform Your Operations?
              </motion.h2>

              {/* Two Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                {/* Primary Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                 
                    <Button
                    variant="default"
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right">
                   <Link href="/demo">
                      Book a Demo
                    </Link>
                  </Button>                    
                </motion.div>

                {/* Secondary Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    
                    variant="outline"
                    size="lg"
                    icon={Play}
                    iconPosition="left"
                  >
                   <Link href="/pricing">
                      See Pricing
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>

          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}