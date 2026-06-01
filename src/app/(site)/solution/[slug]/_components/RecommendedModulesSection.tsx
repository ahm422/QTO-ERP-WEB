'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { easeInOut } from 'framer-motion';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { getModuleIcon } from '@/lib/icon-map';
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
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {modules.map((app) => {
            const Icon = getModuleIcon(app.iconKey);
            return (
              <motion.div key={app.slug} variants={cardVariants}>
                <Link href={`/erp/${app.slug}`} className='block h-full'>
                  <Card
                    variant="interactive"
                    radius="xl"
                    className='h-full group relative overflow-hidden'
                  >
                    <CardHeader>
                      <CardIcon>
                        <Icon className="h-6 w-6" />
                      </CardIcon>
                      <CardBadge color="default">
                        <Sparkles className="h-3 w-3" />
                        Module
                      </CardBadge>
                      <CardTitle>{app.name}</CardTitle>
                      <CardDescription>
                        {app.cardTagline ?? app.shortDescription}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <span className="text-sm font-semibold text-accent inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Explore module
                        <ArrowRight className="h-4 w-4" />
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
