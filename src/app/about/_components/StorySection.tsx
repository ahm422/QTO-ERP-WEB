'use client';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { motion } from 'framer-motion';
import { ExternalLink, Lightbulb } from 'lucide-react';
import { QTO_DEV_URL } from '@/lib/constants';

export default function StorySection() {
  return (
  <section className="section-padding bg-muted/30">
      <div className="container-main">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1 relative rounded-2xl overflow-hidden shadow-xl border border-border aspect-square lg:aspect-auto lg:h-[600px] group"
          >
            <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/0 transition-colors duration-500 z-10 pointer-events-none"></div>
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop" 
              alt="Our Story Illustration" 
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2 space-y-8"
          >
            <div>
              <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Our Story</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Why We Built QTO-ERP</h3>
              
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  We started QTO-ERP because we saw teams struggling with disconnected
                  tools for attendance, HR, and project management. Spreadsheets, siloed
                  apps, and manual processes were holding businesses back from their true potential.
                </p>
                <p>
                  Our mission is simple: to give growing teams one powerful, intuitive
                  platform that handles operational complexity flawlessly, so they can focus entirely on
                  what matters — building great products and serving their customers.
                </p>
                
                <div className="bg-background border border-border rounded-xl p-6 mt-8 shadow-sm">
                  <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Lightbulb className="w-4 h-4" />
                    </span>
                    A Product of Passion
                  </h4>
                  <p className="text-base text-muted-foreground">
                    QTO-ERP is proudly built by{' '}
                    <a
                      href={QTO_DEV_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      QTO Dev <ExternalLink className="h-4 w-4" />
                    </a>
                    , a dedicated team passionate about creating tools that fundamentally make the future of work better.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
