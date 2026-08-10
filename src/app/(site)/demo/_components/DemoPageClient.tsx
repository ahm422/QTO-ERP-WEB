"use client";

import DemoForm from "./DemoForm";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import { GridBackground } from "@/components/ui/grid-background";
import { HeaderSections } from "@/components/ui/HeaderSections";
import { getDemoIcon } from "@/lib/icon-map";
import {
  getCardHover,
  getFadeInUp,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from "@/lib/motion";
import type { DemoPageContent } from "@/types/content";

type DemoPageClientProps = {
  page: DemoPageContent;
};

export default function DemoPageClient({ page }: DemoPageClientProps) {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const fadeUp = getFadeInUp(reduced);
  const hover = getCardHover(reduced);

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden hero-gradient section-padding">
        <GridBackground opacity={0.12} className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-0 size-72 rounded-full bg-hero-glow blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-96 rounded-full bg-hero-glow-alt blur-3xl" />
        </div>

        <div className="container-main relative z-10 text-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl"
          >
            <motion.div variants={item} className="mb-6 flex justify-center">
              <EyebrowBadge
                icon={Sparkles}
                label={page.heroBadge}
                variant="hero"
              />
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mb-6 font-display text-4xl font-bold leading-tight text-hero-foreground md:text-5xl"
            >
              {page.heroTitle}
              <span className="mt-2 block text-hero-accent">
                {page.heroAccent}
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-hero-muted-foreground"
            >
              {page.heroDescription}
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-wrap justify-center gap-4"
            >
              {page.heroBadges.map((badge) => (
                <div
                  key={badge}
                  className="rounded-lg border border-hero-chip-border bg-hero-chip px-6 py-2 text-hero-foreground"
                >
                  <p className="flex items-center justify-center gap-1.5 text-sm font-medium">
                    <Check className="size-4 shrink-0" />
                    {badge}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-muted/30">
        <div className="container-main">
          <HeaderSections
            tag={page.processTag}
            title={page.processTitle}
            description={page.processDescription}
          />

          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            {page.whatToExpect.map((feature) => {
              const Icon = getDemoIcon(feature.iconKey);
              return (
                <motion.div
                  key={feature.title}
                  variants={item}
                  whileHover={hover}
                >
                  <Card
                    variant="interactive"
                    radius="lg"
                    padding="md"
                    className="h-full"
                  >
                    <CardContent className="p-0">
                      <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3">
                        <Icon className="size-6 text-accent" />
                      </div>
                      <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <DemoForm
        sideTitle={page.sideTitle}
        sideDescription={page.sideDescription}
        benefits={page.benefits}
        testimonialQuote={page.testimonialQuote}
        testimonialAuthor={page.testimonialAuthor}
        testimonialRole={page.testimonialRole}
        formFieldOptions={page.formFieldOptions}
      />
    </main>
  );
}
