import {
  BlogPostStatus,
  type BlogPost,
  type ComparisonFeature,
  type PricingPlan,
} from "@prisma/client";
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

// --- Admin helpers ---

export async function listAllBlogPostsAdmin() {
  return getPrisma().blogPost.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { email: true, name: true } } },
  });
}

export async function getBlogPostByIdAdmin(id: string) {
  return getPrisma().blogPost.findUnique({
    where: { id },
    include: { author: { select: { email: true, name: true } } },
  });
}

export async function createBlogPostAdmin(data: {
  slug: string;
  title: string;
  category: string;
  excerpt?: string | null;
  content: string;
  status: BlogPostStatus;
  authorId: string;
  publishedAt?: Date | null;
}) {
  return getPrisma().blogPost.create({ data });
}

export async function updateBlogPostAdmin(
  id: string,
  data: Partial<
    Pick<
      BlogPost,
      | "slug"
      | "title"
      | "category"
      | "excerpt"
      | "content"
      | "status"
      | "publishedAt"
    >
  >,
) {
  return getPrisma().blogPost.update({ where: { id }, data });
}

export async function deleteBlogPostAdmin(id: string) {
  return getPrisma().blogPost.delete({ where: { id } });
}

export async function listAllComparisonAdmin() {
  return getPrisma().comparisonFeature.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function createComparisonAdmin(
  data: Omit<ComparisonFeature, "id" | "createdAt" | "updatedAt">,
) {
  return getPrisma().comparisonFeature.create({ data });
}

export async function updateComparisonAdmin(
  id: string,
  data: Partial<
    Pick<
      ComparisonFeature,
      | "feature"
      | "starter"
      | "growth"
      | "enterprise"
      | "sortOrder"
      | "published"
    >
  >,
) {
  return getPrisma().comparisonFeature.update({ where: { id }, data });
}

export async function deleteComparisonAdmin(id: string) {
  return getPrisma().comparisonFeature.delete({ where: { id } });
}

export async function listAllPricingPlansAdmin() {
  return getPrisma().pricingPlan.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function updatePricingPlanAdmin(
  slug: string,
  data: Partial<
    Pick<
      PricingPlan,
      | "name"
      | "description"
      | "monthlyPriceDisplay"
      | "yearlyPriceDisplay"
      | "popular"
      | "features"
      | "cta"
      | "stripePriceIdMonthly"
      | "stripePriceIdYearly"
      | "sortOrder"
      | "published"
    >
  >,
) {
  return getPrisma().pricingPlan.update({ where: { slug }, data });
}

export async function listPublishedNavResources() {
  return getPrisma().navResource.findMany({
    where: { visible: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, label: true, href: true, iconKey: true, subtitle: true, external: true },
  });
}
