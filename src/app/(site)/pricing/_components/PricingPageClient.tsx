"use client";

import { Suspense, useState } from "react";
import { pricingFaqs } from "@/lib/pricing";
import { HeaderSections } from "@/components/ui/HeaderSections";
import { FAQAccordion } from "@/components/ui/faq";
import PricingToggle from "./PricingToggle";
import PricingCards from "./PricingCards";
import ComparisonTable from "./ComparisonTable";
import CheckoutBanner from "./CheckoutBanner";
import type { ComparisonRow } from "@/types/content";
import type { PricingPlan } from "@/types/pricingPlan";

type PricingPageClientProps = {
  comparisonFeatures: ComparisonRow[];
  plans: PricingPlan[];
};

export default function PricingPageClient({
  comparisonFeatures,
  plans,
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
          <HeaderSections tag="FAQ" title="Pricing Questions" />
          <FAQAccordion faqs={pricingFaqs} />
        </div>
      </section>
    </>
  );
}
