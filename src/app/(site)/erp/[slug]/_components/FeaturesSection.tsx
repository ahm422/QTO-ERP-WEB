"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { HeaderSections } from "@/components/ui/HeaderSections";
import { MarketingButton } from "@/components/ui/marketing-button";
import type { ModuleDetail } from "@/types/content";
import Image from "next/image";
import { getFadeInUp, viewportOnce } from "@/lib/motion";

interface FeaturesSectionProps {
  app: ModuleDetail;
  onVideoOpen: () => void;
}

export default function FeaturesSection({
  app,
  onVideoOpen,
}: FeaturesSectionProps) {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);
  const hasFeatures = app.features.length > 0;

  return (
    <section id="features" className="section-padding bg-muted/30">
      <div className="container-main max-w-[1300px]">
        <HeaderSections
          tag={app.featuresTag}
          title={app.featuresSectionTitle ?? `${app.name} Features`}
          description={app.featuresSectionDescription}
        />

        <div className="space-y-20">
          {app.features.map((feature, index) => {
            const isEven = index % 2 === 0;
            const num = String(index + 1).padStart(2, "0");
            const imageUrl =
              feature.imageUrl ?? app.image ?? app.defaultImage;

            return (
              <div key={feature.title} className="grid gap-12 lg:grid-cols-2">
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  className={isEven ? "" : "lg:order-2"}
                >
                  <div className="flex flex-col gap-5">
                    <span className="select-none text-7xl font-bold leading-none text-accent/10">
                      {num}
                    </span>
                    <h3 className="font-display text-3xl font-bold leading-tight text-foreground lg:text-4xl">
                      {feature.title}
                    </h3>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  className={isEven ? "lg:order-2" : "lg:order-1"}
                >
                  <div className="relative h-[400px] overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--card-shadow)] group">
                    <Image
                      src={imageUrl}
                      alt={feature.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">
                        {num}
                      </p>
                      <h4 className="font-display text-lg font-bold">
                        {feature.title}
                      </h4>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className={`${
            hasFeatures ? "mt-20" : "mt-10"
          } relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/40 p-8 shadow-[var(--card-shadow)] sm:p-10`}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-hero-glow/40 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <h4 className="font-display text-2xl font-bold text-foreground">
                {app.videoCtaTitle}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {app.videoCtaDescription}
              </p>
            </div>
            <MarketingButton
              type="button"
              variant="primary"
              size="lg"
              onClick={onVideoOpen}
              className="shrink-0"
              iconSlide={false}
            >
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-accent-foreground/20">
                <Play className="size-4 fill-current" />
              </span>
              {app.videoCtaButtonLabel}
            </MarketingButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
