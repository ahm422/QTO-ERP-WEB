'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { easeInOut } from 'framer-motion';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardIcon,
  CardBadge,
  CardFooter 
} from '@/components/ui/card';

interface Module {
  slug: string;
  icon: React.ComponentType<any>;
  name: string;
  shortDescription: string;
}

interface RecommendedModulesSectionProps {
  modules: Module[];
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeInOut,
    },
  },
};

export default function RecommendedModulesSection({
  modules,
}: RecommendedModulesSectionProps) {
  return (
    <section className='section-padding bg-slate-50 dark:bg-slate-950'>
      <div className='container-main'>
        <HeaderSections
          tag='Recommended'
          title='Platform For You'
          description="These modules are tailored for your team's needs."
        />
        
        <motion.div 
          className='grid md:grid-cols-3 gap-6'
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {modules.map(
            (app) =>
              app && (
                <motion.div key={app.slug} variants={cardVariants}>
                  <Link href={`/erp/${app.slug}`} className='block h-full'>
                    <Card 
                      variant="interactive" 
                      radius="xl" 
                      className='h-full group relative overflow-hidden'
                    >
                      {/* Hover gradient overlay */}
                      <div className='absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-amber-500/0 group-hover:from-orange-500/5 group-hover:via-orange-500/3 group-hover:to-amber-500/5 transition-all duration-500' />
                      
                      <CardHeader className='relative z-10'>
                        <div className='flex items-start justify-between mb-2'>
                          <CardIcon 
                            color="gradient" 
                            size="lg"
                            className='group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300'
                          >
                            <app.icon className='w-6 h-6' />
                          </CardIcon>
                          
                          {/* Sparkle badge on hover */}
                          <CardBadge 
                            className='opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          >
                            <Sparkles className='w-3 h-3 mr-1' />
                            Popular
                          </CardBadge>
                        </div>
                        
                        <CardTitle className='group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300'>
                          {app.name}
                        </CardTitle>
                        
                        <CardDescription className='line-clamp-2'>
                          {app.shortDescription}
                        </CardDescription>
                      </CardHeader>

                      <CardFooter className='relative z-10 pt-2'>
                        <span className='text-sm font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2 group-hover:gap-3 transition-all duration-300'>
                          Explore Module
                          <span className='w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300'>
                            <ArrowRight className='h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform' />
                          </span>
                        </span>
                      </CardFooter>

                      {/* Bottom border animation */}
                      <div className='absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left' />
                    </Card>
                  </Link>
                </motion.div>
              ),
          )}
        </motion.div>
      </div>
    </section>
  );
}