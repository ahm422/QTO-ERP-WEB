"use client";

import { Suspense, useState } from "react";
import { Tag } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import { GridBackground } from "@/components/ui/grid-background";
import { HeaderSections } from "@/components/ui/HeaderSections";
import { FAQAccordion } from "@/components/ui/faq";
import PricingToggle from "./PricingToggle";
import PricingCards from "./PricingCards";
import ComparisonTable from "./ComparisonTable";
import CheckoutBanner from "./CheckoutBanner";
import type { ComparisonRow, FaqItem, PricingPageContent } from "@/types/content";
import type { PricingPlan } from "@/types/pricingPlan";
import {
  getFadeInUp,
  getStaggerContainer,
  getStaggerItem,
} from "@/lib/motion";

type PricingPageClientProps = {
  page: PricingPageContent;
  comparisonFeatures: ComparisonRow[];
  plans: PricingPlan[];
  faqs: FaqItem[];
};

export default function PricingPageClient({
  page,
  comparisonFeatures,
  plans,
  faqs,
}: PricingPageClientProps) {
  const [yearly, setYearly] = useState(false);
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const fadeUp = getFadeInUp(reduced);

  return (
    <>
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
                icon={Tag}
                label={page.heroBadge}
                variant="hero"
              />
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mb-4 font-display text-4xl font-bold text-hero-foreground md:text-5xl"
            >
              {page.heroTitle}
            </motion.h1>
            <motion.p
              variants={item}
              className="mx-auto max-w-2xl text-lg text-hero-muted-foreground"
            >
              {page.heroSubtitle}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-main">
          <Suspense fallback={null}>
            <CheckoutBanner />
          </Suspense>
          <PricingToggle yearly={yearly} onToggle={setYearly} />
          <PricingCards plans={plans} yearly={yearly} />
        </div>
      </section>

      <ComparisonTable plans={plans} comparisonFeatures={comparisonFeatures} />

      <section className="section-padding">
        <div className="container-main">
          <HeaderSections tag={page.faqTag} title={page.faqTitle} />
          <FAQAccordion faqs={faqs} />
        </div>
      </section>
    </>
  );
}
