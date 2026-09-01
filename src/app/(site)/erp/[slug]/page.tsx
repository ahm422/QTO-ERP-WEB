import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublishedModuleBySlug,
  listPublishedModules,
} from "@/lib/content-db";
import ErpPageClient from "./_components/ErpPageClient";

export const dynamicParams = true;
export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const app = await getPublishedModuleBySlug(slug);
    if (app) {
      return { title: app.metaTitle, description: app.metaDescription };
    }
  } catch (err) {
    console.error("[erp/[slug]] generateMetadata failed", err);
  }
  return { title: "ERP Module | QTO ERP" };
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
