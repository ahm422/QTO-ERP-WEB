"use client";

import { useState } from "react";
import { CTASection } from "@/components/ui//CTASection";
import { VideoModal } from "@/components/ui/VedioModal";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import FeaturesSection from "./FeaturesSection";
import TestimonialsSection from "./TestimonialsSection";
import FAQSection from "./FAQSection";
import AllAppsSection from "./AllAppsSection";
import type { ModuleDetail, ModuleSummary } from "@/types/content";

type ErpPageClientProps = {
  app: ModuleDetail;
  allModules: ModuleSummary[];
};

export default function ErpPageClient({ app, allModules }: ErpPageClientProps) {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <HeroSection app={app} onVideoOpen={() => setVideoOpen(true)} />
      <AboutSection app={app} />
      <FeaturesSection app={app} onVideoOpen={() => setVideoOpen(true)} />
      <TestimonialsSection app={app} />
      <FAQSection app={app} />
      <AllAppsSection apps={allModules} />
      <CTASection
        headline="Ready to Simplify Your Operations with QTO ERP?"
        primaryLabel="Schedule a Demo"
        primaryHref="/demo"
        secondaryLabel="View Pricing"
        secondaryHref="/pricing"
      />
      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} />
    </>
  );
}
