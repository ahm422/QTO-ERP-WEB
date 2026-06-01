import { BlogPostStatus } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  serializeBlogDetail,
  serializeBlogSummary,
  serializeComparisonRow,
  serializePricingPlan,
  serializeModuleDetail,
  serializeModuleSummary,
  serializeSolutionDetail,
  serializeSolutionSummary,
} from "@/lib/content-serializers";

export async function listPublishedModules() {
  const rows = await getPrisma().erpModule.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(serializeModuleSummary);
}

export async function listPublishedModulesBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const rows = await getPrisma().erpModule.findMany({
    where: { published: true, slug: { in: slugs } },
    orderBy: [{ sortOrder: "asc" }],
  });
  const bySlug = new Map(rows.map((r) => [r.slug, serializeModuleSummary(r)]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((m): m is NonNullable<typeof m> => m != null);
}

export async function listPublishedModulesFull() {
  const rows = await getPrisma().erpModule.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(serializeModuleDetail);
}

export async function getPublishedModuleBySlug(slug: string) {
  const row = await getPrisma().erpModule.findFirst({
    where: { slug, published: true },
  });
  return row ? serializeModuleDetail(row) : null;
}

export async function listPublishedModuleSlugs() {
  const rows = await getPrisma().erpModule.findMany({
    where: { published: true },
    select: { slug: true },
    orderBy: [{ sortOrder: "asc" }],
  });
  return rows.map((r) => r.slug);
}

export async function listPublishedSolutions() {
  const rows = await getPrisma().solution.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return rows.map(serializeSolutionSummary);
}

export async function listPublishedSolutionsFull() {
  const rows = await getPrisma().solution.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return rows.map(serializeSolutionDetail);
}

export async function getPublishedSolutionBySlug(slug: string) {
  const row = await getPrisma().solution.findFirst({
    where: { slug, published: true },
  });
  return row ? serializeSolutionDetail(row) : null;
}

export async function listPublishedSolutionSlugs() {
  const rows = await getPrisma().solution.findMany({
    where: { published: true },
    select: { slug: true },
    orderBy: [{ sortOrder: "asc" }],
  });
  return rows.map((r) => r.slug);
}

export async function listPublishedBlogPosts() {
  const rows = await getPrisma().blogPost.findMany({
    where: {
      status: BlogPostStatus.PUBLISHED,
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(serializeBlogSummary);
}

export async function getPublishedBlogPostBySlug(slug: string) {
  const row = await getPrisma().blogPost.findFirst({
    where: {
      slug,
      status: BlogPostStatus.PUBLISHED,
      publishedAt: { not: null },
    },
  });
  return row ? serializeBlogDetail(row) : null;
}

export async function listPublishedBlogSlugs() {
  const rows = await getPrisma().blogPost.findMany({
    where: {
      status: BlogPostStatus.PUBLISHED,
      publishedAt: { not: null },
    },
    select: { slug: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map((r) => r.slug);
}

export async function listPublishedComparison() {
  const rows = await getPrisma().comparisonFeature.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(serializeComparisonRow);
}

export async function listPublishedPricingPlans() {
  const rows = await getPrisma().pricingPlan.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(serializePricingPlan);
}

export async function getPublishedPricingPlanBySlug(slug: string) {
  const row = await getPrisma().pricingPlan.findFirst({
    where: { slug, published: true },
  });
  return row ?? null;
}
