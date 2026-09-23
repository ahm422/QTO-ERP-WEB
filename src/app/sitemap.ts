import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/content-api";
import {
  listPublishedBlogSitemapEntries,
  listPublishedModuleSitemapEntries,
  listPublishedSolutionSitemapEntries,
} from "@/lib/content-db";

// Render on the Worker at request time, never during `next build` — the entry
// helpers below query D1, which is unavailable at prerender time.
export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/blog",
    "/about",
    "/contact",
    "/demo",
    "/allApps",
    "/solutions",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
  }));

  let posts: Awaited<ReturnType<typeof listPublishedBlogSitemapEntries>> = [];
  let modules: Awaited<ReturnType<typeof listPublishedModuleSitemapEntries>> = [];
  let solutions: Awaited<ReturnType<typeof listPublishedSolutionSitemapEntries>> = [];

  try {
    [posts, modules, solutions] = await Promise.all([
      listPublishedBlogSitemapEntries(),
      listPublishedModuleSitemapEntries(),
      listPublishedSolutionSitemapEntries(),
    ]);
  } catch (err) {
    console.error("[sitemap] DB unavailable, emitting static routes only", err);
  }

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? undefined,
    })),
    ...modules.map((mod) => ({
      url: `${base}/erp/${mod.slug}`,
      lastModified: mod.updatedAt ?? undefined,
    })),
    ...solutions.map((solution) => ({
      url: `${base}/solution/${solution.slug}`,
      lastModified: solution.updatedAt ?? undefined,
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
