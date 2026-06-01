import { notFound } from "next/navigation";
import {
  getPublishedModuleBySlug,
  listPublishedModuleSlugs,
  listPublishedModules,
} from "@/lib/content-db";
import ErpPageClient from "./_components/ErpPageClient";

export const runtime = "nodejs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await listPublishedModuleSlugs();
  return slugs.map((slug) => ({ slug }));
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
