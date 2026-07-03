import {
  listPublishedComparison,
  listPublishedPricingPlans,
} from "@/lib/content-db";
import PricingPageClient from "./_components/PricingPageClient";


export default async function PricingPage() {
  const [comparisonFeatures, plans] = await Promise.all([
    listPublishedComparison(),
    listPublishedPricingPlans(),
  ]);
  return (
    <PricingPageClient comparisonFeatures={comparisonFeatures} plans={plans} />
  );
}
