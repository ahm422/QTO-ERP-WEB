"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { HeaderSections } from "@/components/ui/HeaderSections";
import type { ModuleDetail } from "@/types/content";
import { AboutContentType } from "@/types";
import { getFadeInUp, viewportOnce } from "@/lib/motion";

interface AboutSectionProps {
  app: ModuleDetail;
}

export default function AboutSection({ app }: AboutSectionProps) {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);
  const sectionHeadings = ["Overview", "Problem", "Solution", "Results"];

  const aboutContents: AboutContentType[] =
    app.aboutContents && app.aboutContents.length > 0
      ? app.aboutContents
      : app.aboutDescription.map((description, index) => ({
          id: index + 1,
          tag: sectionHeadings[index] ?? "Overview",
          title: sectionHeadings[index] ?? "Overview",
          description,
          image: app.image,
          imageAlt: `${app.name} ${sectionHeadings[index] ?? "Overview"} image`,
        }));

  return (
    <section id="about" className="section-padding bg-background">
      <div className="container-main max-w-[1300px]">
        <HeaderSections tag="About" title={app.aboutTitle} />

        <div className="space-y-20">
          {aboutContents.map((content, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={content.id}
                className="grid items-start gap-12 lg:grid-cols-2"
              >
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  className={isEven ? "" : "lg:order-2"}
                >
                  <div className="flex h-full flex-col rounded-2xl bg-card">
                    <h3 className="mb-6 font-display text-3xl font-bold leading-tight text-foreground lg:text-4xl">
                      {content.title}
                    </h3>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      {content.description}
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
                  <div className="flex h-[340px] items-center justify-center rounded-2xl border border-border bg-background p-6 shadow-[var(--card-shadow)] transition-all duration-300">
                    <div className="relative h-full w-full">
                      <Image
                        src={
                          content.image ||
                          app.image ||
                          "/assets/images/attendance.png"
                        }
                        alt={content.imageAlt || `${app.name} image`}
                        fill
                        className="object-contain object-center"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
