import { and, asc, desc, eq, inArray, isNotNull } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import type { BlogPostStatus } from "@/db/enums";
import {
  blogPosts,
  comparisonFeatures,
  erpModules,
  homeHero,
  navResources,
  pricingPlans,
  solutions,
} from "@/db/schema";
import { getDb } from "@/lib/db";
import {
  HOME_HERO_DEFAULTS,
  HOME_HERO_ID,
} from "@/lib/home-hero-defaults";
import {
  serializeBlogDetail,
  serializeBlogSummary,
  serializeComparisonRow,
  serializeHeroOrbitModule,
  serializeHomeHero,
  serializePricingPlan,
  serializeModuleDetail,
  serializeModuleSummary,
  serializeSolutionDetail,
  serializeSolutionSummary,
} from "@/lib/content-serializers";
import type { HomeHero } from "@/types/content";
import type { UpdateHomeHeroInput } from "@/lib/validations/admin-home-hero";

export type BlogPostRow = InferSelectModel<typeof blogPosts>;
export type ComparisonFeatureRow = InferSelectModel<typeof comparisonFeatures>;
export type PricingPlanRow = InferSelectModel<typeof pricingPlans>;
export type HomeHeroRow = InferSelectModel<typeof homeHero>;
export type ErpModuleRow = InferSelectModel<typeof erpModules>;

export async function listPublishedModules() {
  const rows = await (await getDb())
    .select()
    .from(erpModules)
    .where(eq(erpModules.published, true))
    .orderBy(asc(erpModules.sortOrder), asc(erpModules.name));
  return rows.map(serializeModuleSummary);
}

export async function listPublishedModulesBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const rows = await (await getDb())
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
  const rows = await (await getDb())
    .select()
    .from(erpModules)
    .where(eq(erpModules.published, true))
    .orderBy(asc(erpModules.sortOrder), asc(erpModules.name));
  return rows.map(serializeModuleDetail);
}

export async function getPublishedModuleBySlug(slug: string) {
  const [row] = await (await getDb())
    .select()
    .from(erpModules)
    .where(and(eq(erpModules.slug, slug), eq(erpModules.published, true)))
    .limit(1);
  return row ? serializeModuleDetail(row) : null;
}

export async function listPublishedModuleSlugs() {
  const rows = await (await getDb())
    .select({ slug: erpModules.slug })
    .from(erpModules)
    .where(eq(erpModules.published, true))
    .orderBy(asc(erpModules.sortOrder));
  return rows.map((r) => r.slug);
}

export async function listPublishedSolutions() {
  const rows = await (await getDb())
    .select()
    .from(solutions)
    .where(eq(solutions.published, true))
    .orderBy(asc(solutions.sortOrder), asc(solutions.title));
  return rows.map(serializeSolutionSummary);
}

export async function listPublishedSolutionsFull() {
  const rows = await (await getDb())
    .select()
    .from(solutions)
    .where(eq(solutions.published, true))
    .orderBy(asc(solutions.sortOrder), asc(solutions.title));
  return rows.map(serializeSolutionDetail);
}

export async function getPublishedSolutionBySlug(slug: string) {
  const [row] = await (await getDb())
    .select()
    .from(solutions)
    .where(and(eq(solutions.slug, slug), eq(solutions.published, true)))
    .limit(1);
  return row ? serializeSolutionDetail(row) : null;
}

export async function listPublishedSolutionSlugs() {
  const rows = await (await getDb())
    .select({ slug: solutions.slug })
    .from(solutions)
    .where(eq(solutions.published, true))
    .orderBy(asc(solutions.sortOrder));
  return rows.map((r) => r.slug);
}

export async function listPublishedBlogPosts() {
  const rows = await (await getDb())
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
  const [row] = await (await getDb())
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
  const rows = await (await getDb())
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
  const rows = await (await getDb())
    .select()
    .from(comparisonFeatures)
    .where(eq(comparisonFeatures.published, true))
    .orderBy(asc(comparisonFeatures.sortOrder));
  return rows.map(serializeComparisonRow);
}

export async function listPublishedPricingPlans() {
  const rows = await (await getDb())
    .select()
    .from(pricingPlans)
    .where(eq(pricingPlans.published, true))
    .orderBy(asc(pricingPlans.sortOrder));
  return rows.map(serializePricingPlan);
}

export async function getPublishedPricingPlanBySlug(slug: string) {
  const [row] = await (await getDb())
    .select()
    .from(pricingPlans)
    .where(and(eq(pricingPlans.slug, slug), eq(pricingPlans.published, true)))
    .limit(1);
  return row ?? null;
}

// --- Admin helpers ---

export async function listAllBlogPostsAdmin() {
  return await (await getDb()).query.blogPosts.findMany({
    orderBy: (posts, { desc }) => [desc(posts.updatedAt)],
    with: {
      author: {
        columns: { email: true, name: true },
      },
    },
  });
}

export async function getBlogPostByIdAdmin(id: string) {
  return await (await getDb()).query.blogPosts.findFirst({
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
  const [row] = await (await getDb())
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
  const [row] = await (await getDb())
    .update(blogPosts)
    .set(data)
    .where(eq(blogPosts.id, id))
    .returning();
  return row;
}

export async function deleteBlogPostAdmin(id: string) {
  const [row] = await (await getDb())
    .delete(blogPosts)
    .where(eq(blogPosts.id, id))
    .returning();
  return row;
}

export async function listAllComparisonAdmin() {
  return await (await getDb())
    .select()
    .from(comparisonFeatures)
    .orderBy(asc(comparisonFeatures.sortOrder));
}

export async function createComparisonAdmin(
  data: Omit<ComparisonFeatureRow, "id" | "createdAt" | "updatedAt">,
) {
  const [row] = await (await getDb())
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
  const [row] = await (await getDb())
    .update(comparisonFeatures)
    .set(data)
    .where(eq(comparisonFeatures.id, id))
    .returning();
  return row;
}

export async function deleteComparisonAdmin(id: string) {
  const [row] = await (await getDb())
    .delete(comparisonFeatures)
    .where(eq(comparisonFeatures.id, id))
    .returning();
  return row;
}

export async function listAllPricingPlansAdmin() {
  return await (await getDb())
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
  const [row] = await (await getDb())
    .update(pricingPlans)
    .set(data)
    .where(eq(pricingPlans.slug, slug))
    .returning();
  return row;
}

export async function listPublishedNavResources() {
  return await (await getDb())
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

export async function getHomeHero(): Promise<HomeHero> {
  const [row] = await (await getDb())
    .select()
    .from(homeHero)
    .where(eq(homeHero.id, HOME_HERO_ID))
    .limit(1);
  return row ? serializeHomeHero(row) : { ...HOME_HERO_DEFAULTS };
}

export async function updateHomeHeroAdmin(
  data: Omit<UpdateHomeHeroInput, "orbitOverrides">,
): Promise<HomeHero> {
  const existing = await (await getDb())
    .select()
    .from(homeHero)
    .where(eq(homeHero.id, HOME_HERO_ID))
    .limit(1);

  const base = existing[0]
    ? serializeHomeHero(existing[0])
    : { ...HOME_HERO_DEFAULTS };

  const next = {
    eyebrowText: data.eyebrowText ?? base.eyebrowText,
    titleLine1: data.titleLine1 ?? base.titleLine1,
    titleAccent: data.titleAccent ?? base.titleAccent,
    subtitle: data.subtitle ?? base.subtitle,
    bullets: data.bullets ?? base.bullets,
    primaryCtaLabel: data.primaryCtaLabel ?? base.primaryCtaLabel,
    primaryCtaUrl: data.primaryCtaUrl ?? base.primaryCtaUrl,
    secondaryCtaLabel: data.secondaryCtaLabel ?? base.secondaryCtaLabel,
    secondaryCtaUrl: data.secondaryCtaUrl ?? base.secondaryCtaUrl,
    poweredByText: data.poweredByText ?? base.poweredByText,
    poweredByUrl: data.poweredByUrl ?? base.poweredByUrl,
  };

  const [row] = await (await getDb())
    .insert(homeHero)
    .values({ id: HOME_HERO_ID, ...next })
    .onConflictDoUpdate({
      target: homeHero.id,
      set: next,
    })
    .returning();

  return serializeHomeHero(row);
}

/** Published modules with showInHeroOrbit !== false, for home orbit. */
export async function listHeroOrbitModules() {
  const rows = await (await getDb())
    .select()
    .from(erpModules)
    .where(
      and(eq(erpModules.published, true), eq(erpModules.showInHeroOrbit, true)),
    )
    .orderBy(asc(erpModules.sortOrder), asc(erpModules.name));
  return rows.map(serializeHeroOrbitModule);
}

/** All published modules (incl. hidden from orbit) for admin home-hero form. */
export async function listPublishedModulesForHeroAdmin() {
  const rows = await (await getDb())
    .select()
    .from(erpModules)
    .where(eq(erpModules.published, true))
    .orderBy(asc(erpModules.sortOrder), asc(erpModules.name));
  return rows.map(serializeHeroOrbitModule);
}

export async function updateModuleOrbitAdmin(
  moduleId: string,
  data: Partial<
    Pick<
      ErpModuleRow,
      | "orbitRadius"
      | "orbitTilt"
      | "orbitPhase"
      | "orbitSpeed"
      | "sortOrder"
      | "showInHeroOrbit"
    >
  >,
) {
  const [row] = await (await getDb())
    .update(erpModules)
    .set(data)
    .where(eq(erpModules.id, moduleId))
    .returning();
  return row ? serializeHeroOrbitModule(row) : null;
}

export async function updateModuleSortOrdersAdmin(
  items: Array<{ id: string; sortOrder: number }>,
) {
  await Promise.all(
    items.map(async ({ id, sortOrder }) =>
      await (await getDb())
        .update(erpModules)
        .set({ sortOrder })
        .where(eq(erpModules.id, id)),
    ),
  );
}
