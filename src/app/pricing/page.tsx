"use client";
import { useState } from "react";
import { plans, comparisonFeatures, pricingFaqs } from "@/lib/pricing";
import { HeaderSections } from "@/components/ui/HeaderSections";
import { FAQAccordion } from "@/components/ui/faq";
import { CTASection } from "@/components/ui/CTASection";
import PricingToggle from "./_components/PricingToggle";
import PricingCards from "./_components/PricingCards";
import ComparisonTable from "./_components/ComparisonTable";

export default function PricingPage() {
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
