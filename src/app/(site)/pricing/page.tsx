import {
  getPricingPageContent,
  listPublishedComparison,
  listPublishedFaqs,
  listPublishedPricingPlans,
} from "@/lib/content-db";
import { FAQ_PAGE_KEY_PRICING } from "@/lib/faqs-defaults";
import PricingPageClient from "./_components/PricingPageClient";

export default async function PricingPage() {
  const [page, comparisonFeatures, plans, faqs] = await Promise.all([
    getPricingPageContent(),
    listPublishedComparison(),
    listPublishedPricingPlans(),
    listPublishedFaqs(FAQ_PAGE_KEY_PRICING),
  ]);
  return (
    <PricingPageClient
      page={page}
      comparisonFeatures={comparisonFeatures}
      plans={plans}
      faqs={faqs}
    />
  );
}
