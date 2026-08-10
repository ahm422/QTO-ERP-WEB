import { getDemoPageContent } from "@/lib/content-db";
import DemoPageClient from "./_components/DemoPageClient";

export default async function DemoPage() {
  const page = await getDemoPageContent();
  return <DemoPageClient page={page} />;
}
