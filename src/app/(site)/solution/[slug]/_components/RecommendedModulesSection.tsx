'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { getModuleIcon } from '@/lib/icon-map';
import {
  getCardHover,
  getIconChipHover,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from '@/lib/motion';
import type { ModuleSummary } from '@/types/content';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardIcon,
  CardBadge,
  CardFooter,
} from '@/components/ui/card';

interface RecommendedModulesSectionProps {
  modules: ModuleSummary[];
}

export default function RecommendedModulesSection({
  modules,
}: RecommendedModulesSectionProps) {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const hover = getCardHover(reduced);
  const iconHover = getIconChipHover(reduced);

  if (modules.length === 0) return null;

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
          variants={container}
          initial='hidden'
          whileInView='visible'
          viewport={viewportOnce}
        >
          {modules.map((app) => {
            const Icon = getModuleIcon(app.iconKey);
            return (
              <motion.div key={app.slug} variants={item} whileHover={hover}>
                <Link href={`/erp/${app.slug}`} className='block h-full'>
                  <Card
                    variant='interactive'
                    radius='xl'
                    className='h-full group relative overflow-hidden hover:translate-y-0'
                  >
                    <CardHeader>
                      <motion.div whileHover={iconHover}>
                        <CardIcon>
                          <Icon className='h-6 w-6' />
                        </CardIcon>
                      </motion.div>
                      <CardBadge color='default'>
                        <Sparkles className='h-3 w-3' />
                        Module
                      </CardBadge>
                      <CardTitle>{app.name}</CardTitle>
                      <CardDescription>
                        {app.cardTagline ?? app.shortDescription}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <span className='text-sm font-semibold text-accent inline-flex items-center gap-1 group-hover:gap-2 transition-all'>
                        Explore module
                        <ArrowRight className='h-4 w-4' />
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
