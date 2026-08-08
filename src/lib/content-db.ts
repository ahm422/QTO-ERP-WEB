import { and, asc, desc, eq, inArray, isNotNull, max } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import type { BlogPostStatus } from "@/db/enums";
import {
  blogPosts,
  builtForCards,
  comparisonFeatures,
  erpModules,
  homeHero,
  homeSections,
  homeStats,
  navResources,
  pricingPlans,
  solutions,
  trustedLogos,
} from "@/db/schema";
import { getDb } from "@/lib/db";
import {
  HOME_HERO_DEFAULTS,
  HOME_HERO_ID,
} from "@/lib/home-hero-defaults";
import {
  BUILT_FOR_CARDS_DEFAULTS,
  BUILT_FOR_SECTION_DEFAULT,
  BUILT_FOR_SECTION_KEY,
  HOME_STATS_DEFAULTS,
  TRUSTED_LOGOS_DEFAULTS,
} from "@/lib/home-sections-defaults";
import {
  serializeBlogDetail,
  serializeBlogSummary,
  serializeBuiltForCard,
  serializeComparisonRow,
  serializeHeroOrbitModule,
  serializeHomeHero,
  serializeHomeSection,
  serializeHomeStat,
  serializePricingPlan,
  serializeModuleDetail,
  serializeModuleSummary,
  serializeSolutionDetail,
  serializeSolutionSummary,
  serializeTrustedLogo,
} from "@/lib/content-serializers";
import type {
  BuiltForCard,
  BuiltForSection,
  HomeHero,
  HomeSectionHeader,
  HomeStat,
  TrustedLogo,
} from "@/types/content";
import type { UpdateHomeHeroInput } from "@/lib/validations/admin-home-hero";
import type {
  CreateBuiltForCardInput,
  UpdateBuiltForCardInput,
  UpdateHomeSectionInput,
} from "@/lib/validations/admin-built-for";
import type {
  CreateHomeStatInput,
  UpdateHomeStatInput,
} from "@/lib/validations/admin-home-stats";
import type {
  CreateTrustedLogoInput,
  UpdateTrustedLogoInput,
} from "@/lib/validations/admin-trusted-logos";
import { mediaUrl } from "@/lib/media";

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

// ─── Trusted logos ───────────────────────────────────────────────────────────

function trustedLogoFromDefault(
  d: (typeof TRUSTED_LOGOS_DEFAULTS)[number],
  index: number,
): TrustedLogo {
  return {
    id: `default-logo-${index}`,
    name: d.name,
    imageUrl: d.logoImageKey ? mediaUrl(d.logoImageKey) : null,
    linkUrl: d.linkUrl,
    sortOrder: d.sortOrder,
  };
}

function isMissingRelationError(err: unknown): boolean {
  const msg =
    err instanceof Error
      ? `${err.message} ${err.cause instanceof Error ? err.cause.message : ""}`
      : String(err);
  return /no such table/i.test(msg);
}

export async function listPublishedTrustedLogos(): Promise<TrustedLogo[]> {
  try {
    const rows = await (await getDb())
      .select()
      .from(trustedLogos)
      .where(eq(trustedLogos.published, true))
      .orderBy(asc(trustedLogos.sortOrder));
    if (rows.length === 0) {
      return TRUSTED_LOGOS_DEFAULTS.map(trustedLogoFromDefault);
    }
    return rows.map(serializeTrustedLogo);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] trusted_logos missing — using defaults (run db:migrate:local)",
      );
      return TRUSTED_LOGOS_DEFAULTS.map(trustedLogoFromDefault);
    }
    throw err;
  }
}

export async function listTrustedLogosAdmin() {
  const rows = await (await getDb())
    .select()
    .from(trustedLogos)
    .orderBy(asc(trustedLogos.sortOrder));
  return rows.map((row) => ({
    ...serializeTrustedLogo(row),
    logoImageKey: row.logoImageKey,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function createTrustedLogoAdmin(data: CreateTrustedLogoInput) {
  const db = await getDb();
  let sortOrder = data.sortOrder;
  if (sortOrder === undefined) {
    const [result] = await db
      .select({ maxSort: max(trustedLogos.sortOrder) })
      .from(trustedLogos);
    sortOrder = (result?.maxSort ?? -1) + 1;
  }
  const [row] = await db
    .insert(trustedLogos)
    .values({
      name: data.name,
      logoImageKey: data.logoImageKey ?? null,
      linkUrl: data.linkUrl ?? null,
      published: data.published ?? true,
      sortOrder,
    })
    .returning();
  return {
    ...serializeTrustedLogo(row),
    logoImageKey: row.logoImageKey,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateTrustedLogoAdmin(
  id: string,
  data: UpdateTrustedLogoInput,
) {
  const [row] = await (await getDb())
    .update(trustedLogos)
    .set(data)
    .where(eq(trustedLogos.id, id))
    .returning();
  if (!row) return null;
  return {
    ...serializeTrustedLogo(row),
    logoImageKey: row.logoImageKey,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteTrustedLogoAdmin(id: string) {
  const [existing] = await (await getDb())
    .select({ id: trustedLogos.id })
    .from(trustedLogos)
    .where(eq(trustedLogos.id, id))
    .limit(1);
  if (!existing) return false;
  await (await getDb()).delete(trustedLogos).where(eq(trustedLogos.id, id));
  return true;
}

export async function getTrustedLogoByIdAdmin(id: string) {
  const [row] = await (await getDb())
    .select()
    .from(trustedLogos)
    .where(eq(trustedLogos.id, id))
    .limit(1);
  return row ?? null;
}

// ─── Home stats ──────────────────────────────────────────────────────────────

function homeStatFromDefault(
  d: (typeof HOME_STATS_DEFAULTS)[number],
  index: number,
): HomeStat {
  return {
    id: `default-stat-${index}`,
    label: d.label,
    value: d.value,
    suffix: d.suffix,
    iconKey: d.iconKey,
    sortOrder: d.sortOrder,
  };
}

export async function listPublishedHomeStats(): Promise<HomeStat[]> {
  try {
    const rows = await (await getDb())
      .select()
      .from(homeStats)
      .where(eq(homeStats.published, true))
      .orderBy(asc(homeStats.sortOrder));
    if (rows.length === 0) {
      return HOME_STATS_DEFAULTS.map(homeStatFromDefault);
    }
    return rows.map(serializeHomeStat);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] home_stats missing — using defaults (run db:migrate:local)",
      );
      return HOME_STATS_DEFAULTS.map(homeStatFromDefault);
    }
    throw err;
  }
}

export async function listHomeStatsAdmin() {
  const rows = await (await getDb())
    .select()
    .from(homeStats)
    .orderBy(asc(homeStats.sortOrder));
  return rows.map((row) => ({
    ...serializeHomeStat(row),
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function createHomeStatAdmin(data: CreateHomeStatInput) {
  const db = await getDb();
  let sortOrder = data.sortOrder;
  if (sortOrder === undefined) {
    const [result] = await db
      .select({ maxSort: max(homeStats.sortOrder) })
      .from(homeStats);
    sortOrder = (result?.maxSort ?? -1) + 1;
  }
  const [row] = await db
    .insert(homeStats)
    .values({
      label: data.label,
      value: data.value,
      suffix: data.suffix,
      iconKey: data.iconKey,
      published: data.published ?? true,
      sortOrder,
    })
    .returning();
  return {
    ...serializeHomeStat(row),
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateHomeStatAdmin(id: string, data: UpdateHomeStatInput) {
  const [row] = await (await getDb())
    .update(homeStats)
    .set(data)
    .where(eq(homeStats.id, id))
    .returning();
  if (!row) return null;
  return {
    ...serializeHomeStat(row),
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteHomeStatAdmin(id: string) {
  const [existing] = await (await getDb())
    .select({ id: homeStats.id })
    .from(homeStats)
    .where(eq(homeStats.id, id))
    .limit(1);
  if (!existing) return false;
  await (await getDb()).delete(homeStats).where(eq(homeStats.id, id));
  return true;
}

export async function getHomeStatByIdAdmin(id: string) {
  const [row] = await (await getDb())
    .select()
    .from(homeStats)
    .where(eq(homeStats.id, id))
    .limit(1);
  return row ?? null;
}

// ─── Built for ───────────────────────────────────────────────────────────────

function builtForCardFromDefault(
  d: (typeof BUILT_FOR_CARDS_DEFAULTS)[number],
  index: number,
): BuiltForCard {
  return {
    id: `default-built-for-${index}`,
    title: d.title,
    description: d.description,
    iconKey: d.iconKey,
    sortOrder: d.sortOrder,
  };
}

export async function getHomeSection(
  sectionKey: string = BUILT_FOR_SECTION_KEY,
): Promise<HomeSectionHeader> {
  try {
    const [row] = await (await getDb())
      .select()
      .from(homeSections)
      .where(eq(homeSections.sectionKey, sectionKey))
      .limit(1);
    if (row) return serializeHomeSection(row);
  } catch (err) {
    if (!isMissingRelationError(err)) throw err;
    console.warn(
      "[content-db] home_sections missing — using defaults (run db:migrate:local)",
    );
  }
  if (sectionKey === BUILT_FOR_SECTION_KEY) {
    return {
      tag: BUILT_FOR_SECTION_DEFAULT.tag,
      title: BUILT_FOR_SECTION_DEFAULT.title,
      accent: BUILT_FOR_SECTION_DEFAULT.accent,
      description: BUILT_FOR_SECTION_DEFAULT.description,
    };
  }
  return { tag: "", title: "", accent: "", description: "" };
}

export async function updateHomeSectionAdmin(
  sectionKey: string,
  data: UpdateHomeSectionInput,
): Promise<HomeSectionHeader> {
  const existing = await getHomeSection(sectionKey);
  const next = {
    tag: data.tag ?? existing.tag,
    title: data.title ?? existing.title,
    accent: data.accent ?? existing.accent,
    description: data.description ?? existing.description,
  };
  const [row] = await (await getDb())
    .insert(homeSections)
    .values({ sectionKey, ...next })
    .onConflictDoUpdate({
      target: homeSections.sectionKey,
      set: next,
    })
    .returning();
  return serializeHomeSection(row);
}

export async function listPublishedBuiltForCards(): Promise<BuiltForCard[]> {
  try {
    const rows = await (await getDb())
      .select()
      .from(builtForCards)
      .where(eq(builtForCards.published, true))
      .orderBy(asc(builtForCards.sortOrder));
    if (rows.length === 0) {
      return BUILT_FOR_CARDS_DEFAULTS.map(builtForCardFromDefault);
    }
    return rows.map(serializeBuiltForCard);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] built_for_cards missing — using defaults (run db:migrate:local)",
      );
      return BUILT_FOR_CARDS_DEFAULTS.map(builtForCardFromDefault);
    }
    throw err;
  }
}

export async function getBuiltForSection(): Promise<BuiltForSection> {
  const [section, cards] = await Promise.all([
    getHomeSection(BUILT_FOR_SECTION_KEY),
    listPublishedBuiltForCards(),
  ]);
  return { section, cards };
}

export async function listBuiltForCardsAdmin() {
  const rows = await (await getDb())
    .select()
    .from(builtForCards)
    .orderBy(asc(builtForCards.sortOrder));
  return rows.map((row) => ({
    ...serializeBuiltForCard(row),
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function createBuiltForCardAdmin(data: CreateBuiltForCardInput) {
  const db = await getDb();
  let sortOrder = data.sortOrder;
  if (sortOrder === undefined) {
    const [result] = await db
      .select({ maxSort: max(builtForCards.sortOrder) })
      .from(builtForCards);
    sortOrder = (result?.maxSort ?? -1) + 1;
  }
  const [row] = await db
    .insert(builtForCards)
    .values({
      title: data.title,
      description: data.description,
      iconKey: data.iconKey,
      published: data.published ?? true,
      sortOrder,
    })
    .returning();
  return {
    ...serializeBuiltForCard(row),
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateBuiltForCardAdmin(
  id: string,
  data: UpdateBuiltForCardInput,
) {
  const [row] = await (await getDb())
    .update(builtForCards)
    .set(data)
    .where(eq(builtForCards.id, id))
    .returning();
  if (!row) return null;
  return {
    ...serializeBuiltForCard(row),
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteBuiltForCardAdmin(id: string) {
  const [existing] = await (await getDb())
    .select({ id: builtForCards.id })
    .from(builtForCards)
    .where(eq(builtForCards.id, id))
    .limit(1);
  if (!existing) return false;
  await (await getDb()).delete(builtForCards).where(eq(builtForCards.id, id));
  return true;
}

export async function getBuiltForCardByIdAdmin(id: string) {
  const [row] = await (await getDb())
    .select()
    .from(builtForCards)
    .where(eq(builtForCards.id, id))
    .limit(1);
  return row ?? null;
}
