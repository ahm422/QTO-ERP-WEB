import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/content-api";
import {
  listPublishedBlogSitemapEntries,
  listPublishedModuleSitemapEntries,
  listPublishedSolutionSitemapEntries,
} from "@/lib/content-db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/blog",
    "/about",
    "/contact",
    "/pricing",
    "/demo",
    "/allApps",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
  }));

  const [posts, modules, solutions] = await Promise.all([
    listPublishedBlogSitemapEntries(),
    listPublishedModuleSitemapEntries(),
    listPublishedSolutionSitemapEntries(),
  ]);

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
