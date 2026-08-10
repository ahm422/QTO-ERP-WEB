import { and, asc, desc, eq, inArray, isNotNull, max } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import type { BlogPostStatus } from "@/db/enums";
import {
  blogPosts,
  builtForCards,
  comparisonFeatures,
  demoPageContent,
  erpModules,
  faqs,
  footerContent,
  homeHero,
  homeSections,
  homeStats,
  industryDomains,
  navResources,
  pricingPageContent,
  pricingPlans,
  siteSettings,
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
  ECOSYSTEM_SECTION_DEFAULT,
  ECOSYSTEM_SECTION_KEY,
  FAQ_SECTION_KEY,
  HOME_STATS_DEFAULTS,
  TRUSTED_LOGOS_DEFAULTS,
} from "@/lib/home-sections-defaults";
import {
  FAQ_PAGE_KEY_HOME,
  FAQ_PAGE_KEY_PRICING,
  FAQ_SECTION_DEFAULT,
  HOME_FAQS_DEFAULTS,
  PRICING_FAQS_DEFAULTS,
} from "@/lib/faqs-defaults";
import {
  HOME_FINAL_CTA_DEFAULTS,
  HOME_FINAL_CTA_KEY,
} from "@/lib/home-cta-defaults";
import { FOOTER_CONTENT_DEFAULTS } from "@/lib/footer-defaults";
import { DEMO_PAGE_CONTENT_DEFAULTS } from "@/lib/demo-page-defaults";
import { PRICING_PAGE_CONTENT_DEFAULTS } from "@/lib/pricing-page-defaults";
import {
  INDUSTRY_DOMAINS_DEFAULTS,
  orderIndexFromSortOrder,
} from "@/lib/industry-domains-defaults";
import {
  serializeBlogDetail,
  serializeBlogSummary,
  serializeBuiltForCard,
  serializeComparisonRow,
  serializeDemoPageContent,
  serializeFaq,
  serializeFooterContent,
  serializeHeroOrbitModule,
  serializeHomeFinalCta,
  serializeHomeHero,
  serializeHomeSection,
  serializeHomeStat,
  serializeIndustryDomain,
  serializePricingPageContent,
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
  DemoPageContent,
  FaqItem,
  FooterContent,
  HomeFaqsSection,
  HomeFinalCta,
  PricingPageContent,
  HomeHero,
  HomeSectionHeader,
  HomeStat,
  IndustryDomainSummary,
  IndustryEcosystemSection,
  TrustedLogo,
} from "@/types/content";
import type { UpdateHomeHeroInput } from "@/lib/validations/admin-home-hero";
import type {
  CreateBuiltForCardInput,
  UpdateBuiltForCardInput,
  UpdateHomeSectionInput,
} from "@/lib/validations/admin-built-for";
import type {
  CreateIndustryDomainInput,
  UpdateIndustryDomainInput,
} from "@/lib/validations/admin-industry-domains";
import type {
  CreateHomeStatInput,
  UpdateHomeStatInput,
} from "@/lib/validations/admin-home-stats";
import type {
  CreateTrustedLogoInput,
  UpdateTrustedLogoInput,
} from "@/lib/validations/admin-trusted-logos";
import type {
  CreateFaqInput,
  UpdateFaqInput,
} from "@/lib/validations/admin-faqs";
import type { UpsertHomeFinalCtaInput } from "@/lib/validations/admin-home-cta";
import type { UpsertFooterContentInput } from "@/lib/validations/admin-footer";
import type { UpsertDemoPageContentInput } from "@/lib/validations/admin-demo-page";
import type { UpsertPricingPageContentInput } from "@/lib/validations/admin-pricing-page";
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
  if (sectionKey === ECOSYSTEM_SECTION_KEY) {
    return {
      tag: ECOSYSTEM_SECTION_DEFAULT.tag,
      title: ECOSYSTEM_SECTION_DEFAULT.title,
      accent: ECOSYSTEM_SECTION_DEFAULT.accent,
      description: ECOSYSTEM_SECTION_DEFAULT.description,
    };
  }
  if (sectionKey === FAQ_SECTION_KEY) {
    return {
      tag: FAQ_SECTION_DEFAULT.tag,
      title: FAQ_SECTION_DEFAULT.title,
      accent: FAQ_SECTION_DEFAULT.accent,
      description: FAQ_SECTION_DEFAULT.description,
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

// ─── Industry ecosystems ─────────────────────────────────────────────────────

function industryDomainFromDefault(
  d: (typeof INDUSTRY_DOMAINS_DEFAULTS)[number],
  index: number,
): IndustryDomainSummary {
  return {
    id: `default-industry-domain-${index}`,
    slug: d.slug,
    name: d.name,
    orderIndex: d.orderIndex,
    systemsCount: d.systemsCount,
    iconKey: d.iconKey,
    description: d.description,
    leaders: d.leaders,
    ctaLabel: d.ctaLabel,
    ctaUrl: d.ctaUrl,
    sortOrder: d.sortOrder,
  };
}

export async function listPublishedIndustryDomains(): Promise<
  IndustryDomainSummary[]
> {
  try {
    const rows = await (await getDb())
      .select()
      .from(industryDomains)
      .where(eq(industryDomains.published, true))
      .orderBy(asc(industryDomains.sortOrder), asc(industryDomains.name));
    if (rows.length === 0) {
      return INDUSTRY_DOMAINS_DEFAULTS.map(industryDomainFromDefault);
    }
    return rows.map(serializeIndustryDomain);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] industry_domains missing — using defaults (run db:migrate:local)",
      );
      return INDUSTRY_DOMAINS_DEFAULTS.map(industryDomainFromDefault);
    }
    throw err;
  }
}

export async function getIndustryEcosystemSection(): Promise<IndustryEcosystemSection> {
  const [section, domains] = await Promise.all([
    getHomeSection(ECOSYSTEM_SECTION_KEY),
    listPublishedIndustryDomains(),
  ]);
  return { section, domains };
}

export async function listIndustryDomainsAdmin() {
  const rows = await (await getDb())
    .select()
    .from(industryDomains)
    .orderBy(asc(industryDomains.sortOrder), asc(industryDomains.name));
  return rows.map((row) => ({
    ...serializeIndustryDomain(row),
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function createIndustryDomainAdmin(
  data: CreateIndustryDomainInput,
) {
  const db = await getDb();
  let sortOrder = data.sortOrder;
  if (sortOrder === undefined) {
    const [result] = await db
      .select({ maxSort: max(industryDomains.sortOrder) })
      .from(industryDomains);
    sortOrder = (result?.maxSort ?? -1) + 1;
  }
  const orderIndex =
    data.orderIndex ?? orderIndexFromSortOrder(sortOrder);
  const [row] = await db
    .insert(industryDomains)
    .values({
      slug: data.slug,
      name: data.name,
      orderIndex,
      systemsCount: data.systemsCount,
      iconKey: data.iconKey,
      description: data.description,
      leaders: JSON.stringify(data.leaders ?? []),
      ctaLabel: data.ctaLabel ?? null,
      ctaUrl: data.ctaUrl ?? null,
      published: data.published ?? true,
      sortOrder,
    })
    .returning();
  return {
    ...serializeIndustryDomain(row),
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateIndustryDomainAdmin(
  id: string,
  data: UpdateIndustryDomainInput,
) {
  const patch: Record<string, unknown> = { ...data };
  if (data.leaders !== undefined) {
    patch.leaders = JSON.stringify(data.leaders);
  }
  if (data.sortOrder !== undefined && data.orderIndex === undefined) {
    patch.orderIndex = orderIndexFromSortOrder(data.sortOrder);
  }
  const [row] = await (await getDb())
    .update(industryDomains)
    .set(patch)
    .where(eq(industryDomains.id, id))
    .returning();
  if (!row) return null;
  return {
    ...serializeIndustryDomain(row),
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteIndustryDomainAdmin(id: string) {
  const [existing] = await (await getDb())
    .select({ id: industryDomains.id })
    .from(industryDomains)
    .where(eq(industryDomains.id, id))
    .limit(1);
  if (!existing) return false;
  await (await getDb())
    .delete(industryDomains)
    .where(eq(industryDomains.id, id));
  return true;
}

export async function getIndustryDomainByIdAdmin(id: string) {
  const [row] = await (await getDb())
    .select()
    .from(industryDomains)
    .where(eq(industryDomains.id, id))
    .limit(1);
  return row ?? null;
}

/** After reorder, rewrite orderIndex to 01…N for all domains in sort order. */
export async function syncIndustryDomainOrderIndexes() {
  const db = await getDb();
  const rows = await db
    .select({ id: industryDomains.id, sortOrder: industryDomains.sortOrder })
    .from(industryDomains)
    .orderBy(asc(industryDomains.sortOrder), asc(industryDomains.name));
  await Promise.all(
    rows.map((row, index) =>
      db
        .update(industryDomains)
        .set({
          sortOrder: index,
          orderIndex: orderIndexFromSortOrder(index),
        })
        .where(eq(industryDomains.id, row.id)),
    ),
  );
}

// ─── FAQs (Pattern A — shared page FAQs) ─────────────────────────────────────

function faqFromDefault(
  d: (typeof HOME_FAQS_DEFAULTS)[number],
  index: number,
): FaqItem {
  return {
    id: `default-faq-${index}`,
    question: d.question,
    answer: d.answer,
    category: d.category,
    sortOrder: d.sortOrder,
  };
}

export async function listPublishedFaqs(
  pageKey: string = FAQ_PAGE_KEY_HOME,
): Promise<FaqItem[]> {
  try {
    const rows = await (await getDb())
      .select()
      .from(faqs)
      .where(and(eq(faqs.pageKey, pageKey), eq(faqs.published, true)))
      .orderBy(asc(faqs.sortOrder));
    if (rows.length === 0) {
      if (pageKey === FAQ_PAGE_KEY_HOME) {
        return HOME_FAQS_DEFAULTS.map(faqFromDefault);
      }
      if (pageKey === FAQ_PAGE_KEY_PRICING) {
        return PRICING_FAQS_DEFAULTS.map(faqFromDefault);
      }
    }
    return rows.map(serializeFaq);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] faqs missing — using defaults (run db:migrate:local)",
      );
      if (pageKey === FAQ_PAGE_KEY_HOME) {
        return HOME_FAQS_DEFAULTS.map(faqFromDefault);
      }
      if (pageKey === FAQ_PAGE_KEY_PRICING) {
        return PRICING_FAQS_DEFAULTS.map(faqFromDefault);
      }
      return [];
    }
    throw err;
  }
}

export async function getHomeFaqs(): Promise<HomeFaqsSection> {
  const [section, faqItems] = await Promise.all([
    getHomeSection(FAQ_SECTION_KEY),
    listPublishedFaqs(FAQ_PAGE_KEY_HOME),
  ]);
  return { section, faqs: faqItems };
}

export async function listFaqsAdmin(pageKey: string) {
  const rows = await (await getDb())
    .select()
    .from(faqs)
    .where(eq(faqs.pageKey, pageKey))
    .orderBy(asc(faqs.sortOrder));
  return rows.map((row) => ({
    ...serializeFaq(row),
    pageKey: row.pageKey,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function createFaqAdmin(data: CreateFaqInput) {
  const db = await getDb();
  let sortOrder = data.sortOrder;
  if (sortOrder === undefined) {
    const [result] = await db
      .select({ maxSort: max(faqs.sortOrder) })
      .from(faqs)
      .where(eq(faqs.pageKey, data.pageKey));
    sortOrder = (result?.maxSort ?? -1) + 1;
  }
  const [row] = await db
    .insert(faqs)
    .values({
      pageKey: data.pageKey,
      question: data.question,
      answer: data.answer,
      category: data.category ?? null,
      published: data.published ?? true,
      sortOrder,
    })
    .returning();
  return {
    ...serializeFaq(row),
    pageKey: row.pageKey,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateFaqAdmin(id: string, data: UpdateFaqInput) {
  const [row] = await (await getDb())
    .update(faqs)
    .set(data)
    .where(eq(faqs.id, id))
    .returning();
  if (!row) return null;
  return {
    ...serializeFaq(row),
    pageKey: row.pageKey,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteFaqAdmin(id: string) {
  const [existing] = await (await getDb())
    .select({ id: faqs.id })
    .from(faqs)
    .where(eq(faqs.id, id))
    .limit(1);
  if (!existing) return false;
  await (await getDb()).delete(faqs).where(eq(faqs.id, id));
  return true;
}

export async function getFaqByIdAdmin(id: string) {
  const [row] = await (await getDb())
    .select()
    .from(faqs)
    .where(eq(faqs.id, id))
    .limit(1);
  return row ?? null;
}

// ─── Home final CTA (site_settings JSON) ─────────────────────────────────────

export async function getHomeFinalCta(): Promise<HomeFinalCta> {
  try {
    const [row] = await (await getDb())
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, HOME_FINAL_CTA_KEY))
      .limit(1);
    return serializeHomeFinalCta(row?.value);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] site_settings missing — using home CTA defaults",
      );
      return { ...HOME_FINAL_CTA_DEFAULTS };
    }
    throw err;
  }
}

export async function upsertHomeFinalCtaAdmin(
  data: UpsertHomeFinalCtaInput,
): Promise<HomeFinalCta> {
  const value = JSON.stringify(data);
  await (await getDb())
    .insert(siteSettings)
    .values({ key: HOME_FINAL_CTA_KEY, value })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value },
    });
  return serializeHomeFinalCta(value);
}

// ─── Footer content ──────────────────────────────────────────────────────────

function footerFromDefaults(): FooterContent {
  return {
    brandBlurb: FOOTER_CONTENT_DEFAULTS.brandBlurb,
    builtByLabel: FOOTER_CONTENT_DEFAULTS.builtByLabel,
    builtByUrl: FOOTER_CONTENT_DEFAULTS.builtByUrl,
    newsletterHeading: FOOTER_CONTENT_DEFAULTS.newsletterHeading,
    newsletterCopy: FOOTER_CONTENT_DEFAULTS.newsletterCopy,
    linkGroups: FOOTER_CONTENT_DEFAULTS.linkGroups,
    copyrightText: FOOTER_CONTENT_DEFAULTS.copyrightText,
    bottomLinks: FOOTER_CONTENT_DEFAULTS.bottomLinks,
  };
}

export async function getFooterContent(): Promise<FooterContent> {
  try {
    const [row] = await (await getDb())
      .select()
      .from(footerContent)
      .where(eq(footerContent.id, FOOTER_CONTENT_DEFAULTS.id))
      .limit(1);
    if (!row) return footerFromDefaults();
    return serializeFooterContent(row);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] footer_content missing — using defaults (run db:migrate:local)",
      );
      return footerFromDefaults();
    }
    throw err;
  }
}

export async function upsertFooterContentAdmin(
  data: UpsertFooterContentInput,
): Promise<FooterContent> {
  const [row] = await (await getDb())
    .insert(footerContent)
    .values({
      id: FOOTER_CONTENT_DEFAULTS.id,
      ...data,
    })
    .onConflictDoUpdate({
      target: footerContent.id,
      set: data,
    })
    .returning();
  return serializeFooterContent(row);
}

// ─── Demo page content ───────────────────────────────────────────────────────

function demoPageFromDefaults(): DemoPageContent {
  return {
    heroBadge: DEMO_PAGE_CONTENT_DEFAULTS.heroBadge,
    heroTitle: DEMO_PAGE_CONTENT_DEFAULTS.heroTitle,
    heroAccent: DEMO_PAGE_CONTENT_DEFAULTS.heroAccent,
    heroDescription: DEMO_PAGE_CONTENT_DEFAULTS.heroDescription,
    heroBadges: DEMO_PAGE_CONTENT_DEFAULTS.heroBadges,
    processTag: DEMO_PAGE_CONTENT_DEFAULTS.processTag,
    processTitle: DEMO_PAGE_CONTENT_DEFAULTS.processTitle,
    processDescription: DEMO_PAGE_CONTENT_DEFAULTS.processDescription,
    whatToExpect: DEMO_PAGE_CONTENT_DEFAULTS.whatToExpect,
    sideTitle: DEMO_PAGE_CONTENT_DEFAULTS.sideTitle,
    sideDescription: DEMO_PAGE_CONTENT_DEFAULTS.sideDescription,
    benefits: DEMO_PAGE_CONTENT_DEFAULTS.benefits,
    testimonialQuote: DEMO_PAGE_CONTENT_DEFAULTS.testimonialQuote,
    testimonialAuthor: DEMO_PAGE_CONTENT_DEFAULTS.testimonialAuthor,
    testimonialRole: DEMO_PAGE_CONTENT_DEFAULTS.testimonialRole,
    formFieldOptions: DEMO_PAGE_CONTENT_DEFAULTS.formFieldOptions,
  };
}

export async function getDemoPageContent(): Promise<DemoPageContent> {
  try {
    const [row] = await (await getDb())
      .select()
      .from(demoPageContent)
      .where(eq(demoPageContent.id, DEMO_PAGE_CONTENT_DEFAULTS.id))
      .limit(1);
    if (!row) return demoPageFromDefaults();
    return serializeDemoPageContent(row);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] demo_page_content missing — using defaults (run db:migrate:local)",
      );
      return demoPageFromDefaults();
    }
    throw err;
  }
}

export async function upsertDemoPageContentAdmin(
  data: UpsertDemoPageContentInput,
): Promise<DemoPageContent> {
  const [row] = await (await getDb())
    .insert(demoPageContent)
    .values({
      id: DEMO_PAGE_CONTENT_DEFAULTS.id,
      ...data,
    })
    .onConflictDoUpdate({
      target: demoPageContent.id,
      set: data,
    })
    .returning();
  return serializeDemoPageContent(row);
}

// ─── Pricing page content ────────────────────────────────────────────────────

function pricingPageFromDefaults(): PricingPageContent {
  return {
    heroBadge: PRICING_PAGE_CONTENT_DEFAULTS.heroBadge,
    heroTitle: PRICING_PAGE_CONTENT_DEFAULTS.heroTitle,
    heroSubtitle: PRICING_PAGE_CONTENT_DEFAULTS.heroSubtitle,
    faqTag: PRICING_PAGE_CONTENT_DEFAULTS.faqTag,
    faqTitle: PRICING_PAGE_CONTENT_DEFAULTS.faqTitle,
  };
}

export async function getPricingPageContent(): Promise<PricingPageContent> {
  try {
    const [row] = await (await getDb())
      .select()
      .from(pricingPageContent)
      .where(eq(pricingPageContent.id, PRICING_PAGE_CONTENT_DEFAULTS.id))
      .limit(1);
    if (!row) return pricingPageFromDefaults();
    return serializePricingPageContent(row);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] pricing_page_content missing — using defaults (run db:migrate:local)",
      );
      return pricingPageFromDefaults();
    }
    throw err;
  }
}

export async function upsertPricingPageContentAdmin(
  data: UpsertPricingPageContentInput,
): Promise<PricingPageContent> {
  const [row] = await (await getDb())
    .insert(pricingPageContent)
    .values({
      id: PRICING_PAGE_CONTENT_DEFAULTS.id,
      ...data,
    })
    .onConflictDoUpdate({
      target: pricingPageContent.id,
      set: data,
    })
    .returning();
  return serializePricingPageContent(row);
}
