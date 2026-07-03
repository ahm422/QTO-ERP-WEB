import { and, asc, desc, eq, inArray, isNotNull } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import type { BlogPostStatus } from "@/db/enums";
import {
  blogPosts,
  comparisonFeatures,
  erpModules,
  navResources,
  pricingPlans,
  solutions,
} from "@/db/schema";
import { getDb } from "@/lib/db";
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

export type BlogPostRow = InferSelectModel<typeof blogPosts>;
export type ComparisonFeatureRow = InferSelectModel<typeof comparisonFeatures>;
export type PricingPlanRow = InferSelectModel<typeof pricingPlans>;

export async function listPublishedModules() {
  const rows = await getDb()
    .select()
    .from(erpModules)
    .where(eq(erpModules.published, true))
    .orderBy(asc(erpModules.sortOrder), asc(erpModules.name));
  return rows.map(serializeModuleSummary);
}

export async function listPublishedModulesBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const rows = await getDb()
    .select()
    .from(erpModules)
    .where(and(eq(erpModules.published, true), inArray(erpModules.slug, slugs)))
    .orderBy(asc(erpModules.sortOrder));
  const bySlug = new Map(rows.map((r) => [r.slug, serializeModuleSummary(r)]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((m): m is NonNullable<typeof m> => m != null);
}

export async function listPublishedModulesFull() {
  const rows = await getDb()
    .select()
    .from(erpModules)
    .where(eq(erpModules.published, true))
    .orderBy(asc(erpModules.sortOrder), asc(erpModules.name));
  return rows.map(serializeModuleDetail);
}

export async function getPublishedModuleBySlug(slug: string) {
  const [row] = await getDb()
    .select()
    .from(erpModules)
    .where(and(eq(erpModules.slug, slug), eq(erpModules.published, true)))
    .limit(1);
  return row ? serializeModuleDetail(row) : null;
}

export async function listPublishedModuleSlugs() {
  const rows = await getDb()
    .select({ slug: erpModules.slug })
    .from(erpModules)
    .where(eq(erpModules.published, true))
    .orderBy(asc(erpModules.sortOrder));
  return rows.map((r) => r.slug);
}

export async function listPublishedSolutions() {
  const rows = await getDb()
    .select()
    .from(solutions)
    .where(eq(solutions.published, true))
    .orderBy(asc(solutions.sortOrder), asc(solutions.title));
  return rows.map(serializeSolutionSummary);
}

export async function listPublishedSolutionsFull() {
  const rows = await getDb()
    .select()
    .from(solutions)
    .where(eq(solutions.published, true))
    .orderBy(asc(solutions.sortOrder), asc(solutions.title));
  return rows.map(serializeSolutionDetail);
}

export async function getPublishedSolutionBySlug(slug: string) {
  const [row] = await getDb()
    .select()
    .from(solutions)
    .where(and(eq(solutions.slug, slug), eq(solutions.published, true)))
    .limit(1);
  return row ? serializeSolutionDetail(row) : null;
}

export async function listPublishedSolutionSlugs() {
  const rows = await getDb()
    .select({ slug: solutions.slug })
    .from(solutions)
    .where(eq(solutions.published, true))
    .orderBy(asc(solutions.sortOrder));
  return rows.map((r) => r.slug);
}

export async function listPublishedBlogPosts() {
  const rows = await getDb()
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.status, "PUBLISHED"),
        isNotNull(blogPosts.publishedAt),
      ),
    )
    .orderBy(desc(blogPosts.publishedAt));
  return rows.map(serializeBlogSummary);
}

export async function getPublishedBlogPostBySlug(slug: string) {
  const [row] = await getDb()
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.slug, slug),
        eq(blogPosts.status, "PUBLISHED"),
        isNotNull(blogPosts.publishedAt),
      ),
    )
    .limit(1);
  return row ? serializeBlogDetail(row) : null;
}

export async function listPublishedBlogSlugs() {
  const rows = await getDb()
    .select({ slug: blogPosts.slug })
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.status, "PUBLISHED"),
        isNotNull(blogPosts.publishedAt),
      ),
    )
    .orderBy(desc(blogPosts.publishedAt));
  return rows.map((r) => r.slug);
}

export async function listPublishedComparison() {
  const rows = await getDb()
    .select()
    .from(comparisonFeatures)
    .where(eq(comparisonFeatures.published, true))
    .orderBy(asc(comparisonFeatures.sortOrder));
  return rows.map(serializeComparisonRow);
}

export async function listPublishedPricingPlans() {
  const rows = await getDb()
    .select()
    .from(pricingPlans)
    .where(eq(pricingPlans.published, true))
    .orderBy(asc(pricingPlans.sortOrder));
  return rows.map(serializePricingPlan);
}

export async function getPublishedPricingPlanBySlug(slug: string) {
  const [row] = await getDb()
    .select()
    .from(pricingPlans)
    .where(and(eq(pricingPlans.slug, slug), eq(pricingPlans.published, true)))
    .limit(1);
  return row ?? null;
}

// --- Admin helpers ---

export async function listAllBlogPostsAdmin() {
  return getDb().query.blogPosts.findMany({
    orderBy: (posts, { desc }) => [desc(posts.updatedAt)],
    with: {
      author: {
        columns: { email: true, name: true },
      },
    },
  });
}

export async function getBlogPostByIdAdmin(id: string) {
  return getDb().query.blogPosts.findFirst({
    where: (posts, { eq }) => eq(posts.id, id),
    with: {
      author: {
        columns: { email: true, name: true },
      },
    },
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
  const [row] = await getDb()
    .insert(blogPosts)
    .values(data)
    .returning();
  return row;
}

export async function updateBlogPostAdmin(
  id: string,
  data: Partial<
    Pick<
      BlogPostRow,
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
  const [row] = await getDb()
    .update(blogPosts)
    .set(data)
    .where(eq(blogPosts.id, id))
    .returning();
  return row;
}

export async function deleteBlogPostAdmin(id: string) {
  const [row] = await getDb()
    .delete(blogPosts)
    .where(eq(blogPosts.id, id))
    .returning();
  return row;
}

export async function listAllComparisonAdmin() {
  return getDb()
    .select()
    .from(comparisonFeatures)
    .orderBy(asc(comparisonFeatures.sortOrder));
}

export async function createComparisonAdmin(
  data: Omit<ComparisonFeatureRow, "id" | "createdAt" | "updatedAt">,
) {
  const [row] = await getDb()
    .insert(comparisonFeatures)
    .values(data)
    .returning();
  return row;
}

export async function updateComparisonAdmin(
  id: string,
  data: Partial<
    Pick<
      ComparisonFeatureRow,
      | "feature"
      | "starter"
      | "growth"
      | "enterprise"
      | "sortOrder"
      | "published"
    >
  >,
) {
  const [row] = await getDb()
    .update(comparisonFeatures)
    .set(data)
    .where(eq(comparisonFeatures.id, id))
    .returning();
  return row;
}

export async function deleteComparisonAdmin(id: string) {
  const [row] = await getDb()
    .delete(comparisonFeatures)
    .where(eq(comparisonFeatures.id, id))
    .returning();
  return row;
}

export async function listAllPricingPlansAdmin() {
  return getDb()
    .select()
    .from(pricingPlans)
    .orderBy(asc(pricingPlans.sortOrder));
}

export async function updatePricingPlanAdmin(
  slug: string,
  data: Partial<
    Pick<
      PricingPlanRow,
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
  const [row] = await getDb()
    .update(pricingPlans)
    .set(data)
    .where(eq(pricingPlans.slug, slug))
    .returning();
  return row;
}

export async function listPublishedNavResources() {
  return getDb()
    .select({
      id: navResources.id,
      label: navResources.label,
      href: navResources.href,
      iconKey: navResources.iconKey,
      subtitle: navResources.subtitle,
      external: navResources.external,
    })
    .from(navResources)
    .where(eq(navResources.visible, true))
    .orderBy(asc(navResources.sortOrder));
}
