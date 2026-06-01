"use client";
import { useState } from "react";
import { plans, pricingFaqs } from "@/lib/pricing";
import { HeaderSections } from "@/components/ui/HeaderSections";
import { FAQAccordion } from "@/components/ui/faq";
import PricingToggle from "./PricingToggle";
import PricingCards from "./PricingCards";
import ComparisonTable from "./ComparisonTable";
import type { ComparisonRow } from "@/types/content";

type PricingPageClientProps = {
  comparisonFeatures: ComparisonRow[];
};

export default function PricingPageClient({
  comparisonFeatures,
}: PricingPageClientProps) {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      <section className="section-padding">
        <div className="container-main">
          <HeaderSections
            tag="Pricing"
            title="Simple, Transparent Pricing"
            description="Start free. Scale as you grow. No hidden fees."
          />
          <PricingToggle yearly={yearly} onToggle={setYearly} />
          <PricingCards plans={plans} yearly={yearly} />
        </div>
      </section>

      <ComparisonTable plans={plans} comparisonFeatures={comparisonFeatures} />

      <section className="section-padding">
        <div className="container-main">
          <HeaderSections tag="FAQ" title="Pricing Questions" />
          <FAQAccordion faqs={pricingFaqs} />
        </div>
      </section>

    </>
  );
}
