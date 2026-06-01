import { listPublishedComparison } from "@/lib/content-db";
import PricingPageClient from "./_components/PricingPageClient";

export const runtime = "nodejs";

export default async function PricingPage() {
  const comparisonFeatures = await listPublishedComparison();
  return <PricingPageClient comparisonFeatures={comparisonFeatures} />;
}
