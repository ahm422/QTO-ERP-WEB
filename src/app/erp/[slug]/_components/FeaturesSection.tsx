"use client";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { HeaderSections } from "@/components/ui/HeaderSections";
import { PlatformType } from "@/types";
import Image from "next/image";
interface FeaturesSectionProps {
  app: PlatformType;
  onVideoOpen: () => void;
}

const smoothEase: [number, number, number, number] = [0.165, 0.84, 0.44, 1];
// Feature image URLs for visual demonstrations
const featureImages = [
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop",
];

export default function FeaturesSection({
  app,
  onVideoOpen,
}: FeaturesSectionProps) {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container-main max-w-[1300px]">
        {/* Section Header */}
        <div className="text-center mb-16">
          <HeaderSections
            tag="Features"
            title={app.featuresSectionTitle ?? `${app.name} Features`}
            description="A powerful set of tools built to give your team full control and visibility."
          />
        </div>

        {/* Alternating rows */}
        <div className="space-y-20">
          {app.features.map((feature, index) => {
            const isEven = index % 2 === 0;
            const num = String(index + 1).padStart(2, "0");
            const imageUrl = featureImages[index % featureImages.length];

            return (
              <div key={feature.title} className="grid lg:grid-cols-2 gap-12 ">
                {/* Description side */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: smoothEase }}
                  className={isEven ? "" : "lg:order-2"}
                >
                  <div className="flex flex-col gap-5">
                    <span className="text-7xl font-black leading-none select-none text-accent/10">
                      {num}
                    </span>
                    <h3 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>

                {/* Visual panel side */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? 60 : -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: smoothEase }}
                  className={isEven ? "lg:order-2" : "lg:order-1"}
                >
                  <div
                    className="rounded-2xl bg-background border border-border h-[400px] overflow-hidden relative group"
                    style={{
                      boxShadow:
                        "0 25px 60px -20px rgba(0,0,0,0.12), 0 10px 25px -15px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt={feature.title}
                      fill
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Accent glow blob */}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {/* Feature label overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <p className="text-sm font-semibold text-accent mb-2 uppercase tracking-wider">
                        {num}
                      </p>
                      <h4 className="text-lg font-bold">{feature.title}</h4>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Video CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: smoothEase }}
          className="mt-20 rounded-2xl bg-card border border-border p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ boxShadow: "0 20px 50px -18px rgba(0,0,0,0.08)" }}
        >
          <div>
            <h4 className="text-xl font-bold text-foreground mb-1">
              {app.videoCtaTitle ?? `See ${app.name} in action`}
            </h4>
            <p className="text-sm text-muted-foreground">
              {app.videoCtaDescription ??
                "Watch a quick overview of all key features and how they work together seamlessly."}
            </p>
          </div>
          <button
            onClick={onVideoOpen}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-md bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition-colors duration-200 shrink-0"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
              <Play className="h-4 w-4 fill-current" />
            </span>
            Watch Demo
          </button>
        </motion.div>
      </div>
    </section>
  );
}
