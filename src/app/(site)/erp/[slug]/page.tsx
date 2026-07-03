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

export default async function PlatformDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const app = await getPublishedModuleBySlug(slug);
  if (!app) {
    notFound();
  }
  const allModules = await listPublishedModules();
  return <ErpPageClient app={app} allModules={allModules} />;
}
