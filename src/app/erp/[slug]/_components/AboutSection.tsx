"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { HeaderSections } from "@/components/ui/HeaderSections";
import { PlatformType } from "@/types";
import { AboutContentType } from "@/types";

interface AboutSectionProps {
  app: PlatformType;
}

const smoothEase: [number, number, number, number] = [0.165, 0.84, 0.44, 1];

export default function AboutSection({ app }: AboutSectionProps) {
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
    <section id="about" className="py-20 bg-background">
      <div className="container-main max-w-[1300px]">
        {/* Section Header */}
        <div className="text-center mb-16">
          <HeaderSections tag="About" title={app.aboutTitle} />
        </div>

        <div className="space-y-20">
          {aboutContents.map((content, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={content.id}
                className="grid lg:grid-cols-2 gap-12 items-start"
              >
                {/* Content Side */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: smoothEase }}
                  className={`${isEven ? "" : "lg:order-2"}`}
                >
                  <div className="rounded-2xl bg-card  h-full flex flex-col">
                    {/* Heading aligned to top */}
                    <h3 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-6 text-balance-700">
                      {content.title}
                    </h3>

                    {/* Paragraph perfectly spaced */}
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {content.description}
                    </p>
                  </div>
                </motion.div>

                {/* Image Side */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? 60 : -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: smoothEase }}
                  className={`${isEven ? "lg:order-2" : "lg:order-1"}`}
                >
                  <div
                    className="rounded-2xl bg-background h-[340px] flex items-center justify-center p-6 transition-all duration-300"
                    style={{
                      boxShadow:
                        "0 25px 60px -20px rgba(0,0,0,0.12), 0 10px 25px -15px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src="/assets/images/clockin-out.png"
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
