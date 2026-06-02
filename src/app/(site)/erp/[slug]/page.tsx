import { notFound } from "next/navigation";
import {
  getPublishedModuleBySlug,
  listPublishedModuleSlugs,
  listPublishedModules,
} from "@/lib/content-db";
import ErpPageClient from "./_components/ErpPageClient";

export const runtime = "nodejs";
export const dynamicParams = true; // serve unknown slugs dynamically

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const slugs = await listPublishedModuleSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    // graceful fallback — build succeeds without DB
    return [];
  }
}

export default async function PlatformDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const app = await getPublishedModuleBySlug(slug);
  if (!app) {
    notFound();
  }
  const allModules = await listPublishedModules();
  return <ErpPageClient app={app} allModules={allModules} />;
}
