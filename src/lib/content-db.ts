import { and, asc, desc, eq, inArray, isNotNull, like, max, ne, or, sql } from "drizzle-orm";
import type { InferSelectModel, SQL } from "drizzle-orm";
import type { BlogPostStatus } from "@/db/enums";
import {
  aboutStory,
  aboutValues,
  blogPosts,
  builtForCards,
  chatbotKnowledge,
  contactChannels,
  contactPageContent,
  contactSupportContent,
  demoPageContent,
  erpModules,
  faqs,
  footerContent,
  homeHero,
  homeSections,
  homeStats,
  industryDomains,
  navResources,
  pageHeroContent,
  siteSettings,
  solutions,
  trustedLogos,
  users,
} from "@/db/schema";
import { getDb } from "@/lib/db";
import { scheduleRagSync } from "@/lib/rag-sync";
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
  FAQ_PAGE_KEY_CONTACT,
  FAQ_PAGE_KEY_HOME,
  FAQ_SECTION_DEFAULT,
  CONTACT_FAQS_DEFAULTS,
  HOME_FAQS_DEFAULTS,
} from "@/lib/faqs-defaults";
import {
  CONTACT_CHANNELS_DEFAULTS,
  CONTACT_PAGE_CONTENT_DEFAULTS,
  CONTACT_PAGE_CONTENT_ID,
  CONTACT_SUPPORT_CONTENT_DEFAULTS,
  CONTACT_SUPPORT_CONTENT_ID,
  DEFAULT_MODULE_ROLLOUT_SECTION,
  DEFAULT_MODULE_ROLLOUT_STEPS,
} from "@/lib/contact-page-defaults";
import {
  HOME_FINAL_CTA_DEFAULTS,
  HOME_FINAL_CTA_KEY,
} from "@/lib/home-cta-defaults";
import {
  ABOUT_FINAL_CTA_DEFAULTS,
  ABOUT_FINAL_CTA_KEY,
} from "@/lib/about-cta-defaults";
import {
  ABOUT_STORY_DEFAULTS,
  ABOUT_STORY_ID,
} from "@/lib/about-story-defaults";
import { ABOUT_VALUES_DEFAULTS } from "@/lib/about-values-defaults";
import { FOOTER_CONTENT_DEFAULTS } from "@/lib/footer-defaults";
import { DEMO_PAGE_CONTENT_DEFAULTS } from "@/lib/demo-page-defaults";
import {
  pageHeroFromDefaults,
  PAGE_HERO_KEY_ABOUT,
  type PageHeroPageKey,
} from "@/lib/page-hero-defaults";
import {
  INDUSTRY_DOMAINS_DEFAULTS,
  orderIndexFromSortOrder,
} from "@/lib/industry-domains-defaults";
import {
  aboutStoryFromDefaults,
  serializeAboutFinalCta,
  serializeAboutStory,
  serializeAboutValue,
  serializeBlogDetail,
  serializeBlogSummary,
  serializeBuiltForCard,
  serializeChatbotKnowledge,
  serializeDemoPageContent,
  serializeFaq,
  serializeFooterContent,
  serializeHeroOrbitModule,
  serializeHomeFinalCta,
  serializeHomeHero,
  serializeHomeSection,
  serializeHomeStat,
  serializeIndustryDomain,
  serializePageHeroContent,
  resolveMediaPath,
  serializeFeatures,
  serializeModuleDetail,
  serializeModuleSummary,
  serializeSolutionDetail,
  serializeSolutionSummary,
  serializeTrustedLogo,
} from "@/lib/content-serializers";
import type {
  AboutPageContent,
  AboutStory,
  AboutValue,
  BuiltForCard,
  BuiltForSection,
  ContactChannel,
  ContactPageContent,
  ContactSupportContent,
  DemoPageContent,
  FaqItem,
  FooterContent,
  HomeFaqsSection,
  HomeFinalCta,
  PageHeroContent,
  HomeHero,
  HomeSectionHeader,
  HomeStat,
  IndustryDomainSummary,
  IndustryEcosystemSection,
  TrustedLogo,
} from "@/types/content";
import type { UpsertContactPageContentInput } from "@/lib/validations/admin-contact";
import type { UpsertContactSupportContentInput } from "@/lib/validations/admin-contact";
import type {
  CreateContactChannelInput,
  UpdateContactChannelInput,
} from "@/lib/validations/admin-contact";
import type {
  CreateModuleInput,
  UpdateModuleInput,
} from "@/lib/validations/admin-modules";
import type {
  CreateSolutionInput,
  UpdateSolutionInput,
} from "@/lib/validations/admin-solutions";
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
import type {
  CreateChatbotKnowledgeInput,
  UpdateChatbotKnowledgeInput,
} from "@/lib/validations/admin-chatbot-knowledge";
import type { UpsertHomeFinalCtaInput } from "@/lib/validations/admin-home-cta";
import type { UpsertFooterContentInput } from "@/lib/validations/admin-footer";
import type { UpsertDemoPageContentInput } from "@/lib/validations/admin-demo-page";
import type { UpsertPageHeroContentInput } from "@/lib/validations/admin-page-hero";
import type {
  CreateAboutValueInput,
  UpdateAboutValueInput,
  UpsertAboutFinalCtaInput,
  UpsertAboutStoryInput,
} from "@/lib/validations/admin-about";
import { mediaUrl } from "@/lib/media";
import { createId } from "@paralleldrive/cuid2";

export type BlogPostRow = InferSelectModel<typeof blogPosts>;
export type HomeHeroRow = InferSelectModel<typeof homeHero>;
export type ErpModuleRow = InferSelectModel<typeof erpModules>;

/**
 * Module/solution list getters feed the shared SiteLayout (navbar + footer), so a
 * throw here 500s every marketing page. Degrade to an empty list if the tables /
 * columns are missing (e.g. a migration hasn't been applied yet) — mirrors the
 * blog getters and the `isMissingRelationError` pattern used elsewhere.
 */
function logContentDbError(tag: string, err: unknown) {
  if (isMissingRelationError(err)) {
    console.warn(`[content-db:${tag}] table/column missing — returning empty (run db:migrate)`);
  } else {
    console.error(`[content-db:${tag}] DB unavailable — returning empty`, err);
  }
}

export async function listPublishedModules() {
  try {
    const rows = await (await getDb())
      .select()
      .from(erpModules)
      .where(eq(erpModules.published, true))
      .orderBy(asc(erpModules.sortOrder), asc(erpModules.name));
    return rows.map(serializeModuleSummary);
  } catch (err) {
    logContentDbError("listPublishedModules", err);
    return [];
  }
}

export async function listPublishedModulesBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  try {
    const rows = await (await getDb())
      .select()
      .from(erpModules)
      .where(and(eq(erpModules.published, true), inArray(erpModules.slug, slugs)))
      .orderBy(asc(erpModules.sortOrder));
    const bySlug = new Map(rows.map((r) => [r.slug, serializeModuleSummary(r)]));
    return slugs
      .map((slug) => bySlug.get(slug))
      .filter((m): m is NonNullable<typeof m> => m != null);
  } catch (err) {
    logContentDbError("listPublishedModulesBySlugs", err);
    return [];
  }
}

export async function listPublishedModulesFull() {
  try {
    const rows = await (await getDb())
      .select()
      .from(erpModules)
      .where(eq(erpModules.published, true))
      .orderBy(asc(erpModules.sortOrder), asc(erpModules.name));
    return rows.map(serializeModuleDetail);
  } catch (err) {
    logContentDbError("listPublishedModulesFull", err);
    return [];
  }
}

export async function getPublishedModuleBySlug(slug: string) {
  try {
    const [row] = await (await getDb())
      .select()
      .from(erpModules)
      .where(and(eq(erpModules.slug, slug), eq(erpModules.published, true)))
      .limit(1);
    return row ? serializeModuleDetail(row) : null;
  } catch (err) {
    logContentDbError("getPublishedModuleBySlug", err);
    return null;
  }
}

export async function listPublishedModuleSlugs() {
  try {
    const rows = await (await getDb())
      .select({ slug: erpModules.slug })
      .from(erpModules)
      .where(eq(erpModules.published, true))
      .orderBy(asc(erpModules.sortOrder));
    return rows.map((r) => r.slug);
  } catch (err) {
    logContentDbError("listPublishedModuleSlugs", err);
    return [];
  }
}

export async function listPublishedSolutions() {
  try {
    const rows = await (await getDb())
      .select()
      .from(solutions)
      .where(eq(solutions.published, true))
      .orderBy(asc(solutions.sortOrder), asc(solutions.title));
    return rows.map(serializeSolutionSummary);
  } catch (err) {
    logContentDbError("listPublishedSolutions", err);
    return [];
  }
}

export async function listPublishedSolutionsFull() {
  try {
    const rows = await (await getDb())
      .select()
      .from(solutions)
      .where(eq(solutions.published, true))
      .orderBy(asc(solutions.sortOrder), asc(solutions.title));
    return rows.map(serializeSolutionDetail);
  } catch (err) {
    logContentDbError("listPublishedSolutionsFull", err);
    return [];
  }
}

export async function getPublishedSolutionBySlug(slug: string) {
  try {
    const [row] = await (await getDb())
      .select()
      .from(solutions)
      .where(and(eq(solutions.slug, slug), eq(solutions.published, true)))
      .limit(1);
    return row ? serializeSolutionDetail(row) : null;
  } catch (err) {
    logContentDbError("getPublishedSolutionBySlug", err);
    return null;
  }
}

export async function listPublishedSolutionSlugs() {
  try {
    const rows = await (await getDb())
      .select({ slug: solutions.slug })
      .from(solutions)
      .where(eq(solutions.published, true))
      .orderBy(asc(solutions.sortOrder));
    return rows.map((r) => r.slug);
  } catch (err) {
    logContentDbError("listPublishedSolutionSlugs", err);
    return [];
  }
}

const DEFAULT_BLOG_PAGE_SIZE = 9;
const MAX_BLOG_PAGE_SIZE = 24;

export type ListPublishedBlogPostsOptions = {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
};

function publishedBlogCondition(...extras: Array<SQL | undefined>) {
  return and(
    eq(blogPosts.status, "PUBLISHED"),
    isNotNull(blogPosts.publishedAt),
    ...extras.filter((clause): clause is SQL => Boolean(clause)),
  );
}

function blogTagExists(tag: string) {
  return sql`exists (select 1 from json_each(${blogPosts.tags}) where json_each.value = ${tag})`;
}

function blogSearchMatches(search: string) {
  const pattern = `%${search.replace(/[%_]/g, "\\$&")}%`;
  return or(
    like(blogPosts.title, pattern),
    like(blogPosts.excerpt, pattern),
  );
}

export async function listPublishedBlogPosts(
  options: ListPublishedBlogPostsOptions = {},
) {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(
    MAX_BLOG_PAGE_SIZE,
    Math.max(1, options.limit ?? DEFAULT_BLOG_PAGE_SIZE),
  );
  const category = options.category?.trim();
  const tag = options.tag?.trim();
  const search = options.search?.trim().slice(0, 100);

  const rows = await (await getDb())
    .select({
      post: blogPosts,
      authorName: users.name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(
      publishedBlogCondition(
        category ? eq(blogPosts.category, category) : undefined,
        tag ? blogTagExists(tag) : undefined,
        search ? blogSearchMatches(search) : undefined,
      ),
    )
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit + 1)
    .offset((page - 1) * limit);

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;

  return {
    posts: pageRows.map((row) =>
      serializeBlogSummary(row.post, row.authorName),
    ),
    page,
    limit,
    hasMore,
  };
}

export async function getPublishedBlogPostBySlug(slug: string) {
  const [row] = await (await getDb())
    .select({
      post: blogPosts,
      authorName: users.name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(publishedBlogCondition(eq(blogPosts.slug, slug)))
    .limit(1);
  return row ? serializeBlogDetail(row.post, row.authorName) : null;
}

export async function listPublishedBlogSlugs() {
  const rows = await (await getDb())
    .select({ slug: blogPosts.slug })
    .from(blogPosts)
    .where(publishedBlogCondition())
    .orderBy(desc(blogPosts.publishedAt));
  return rows.map((r) => r.slug);
}

export async function listPublishedBlogSitemapEntries() {
  const rows = await (await getDb())
    .select({
      slug: blogPosts.slug,
      updatedAt: blogPosts.updatedAt,
    })
    .from(blogPosts)
    .where(publishedBlogCondition())
    .orderBy(desc(blogPosts.publishedAt));
  return rows;
}

export async function listPublishedModuleSitemapEntries() {
  const rows = await (await getDb())
    .select({
      slug: erpModules.slug,
      updatedAt: erpModules.updatedAt,
    })
    .from(erpModules)
    .where(eq(erpModules.published, true))
    .orderBy(asc(erpModules.sortOrder));
  return rows;
}

export async function listPublishedSolutionSitemapEntries() {
  const rows = await (await getDb())
    .select({
      slug: solutions.slug,
      updatedAt: solutions.updatedAt,
    })
    .from(solutions)
    .where(eq(solutions.published, true))
    .orderBy(asc(solutions.sortOrder));
  return rows;
}

export async function listFeaturedBlogPosts(limit = 2) {
  const rows = await (await getDb())
    .select({
      post: blogPosts,
      authorName: users.name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(publishedBlogCondition(eq(blogPosts.isFeatured, true)))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(Math.max(1, limit));
  return rows.map((row) => serializeBlogSummary(row.post, row.authorName));
}

export async function listCompanyNewsBlogPosts(limit = 3) {
  const rows = await (await getDb())
    .select({
      post: blogPosts,
      authorName: users.name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(publishedBlogCondition(eq(blogPosts.isCompanyNews, true)))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(Math.max(1, limit));
  return rows.map((row) => serializeBlogSummary(row.post, row.authorName));
}

export async function listPopularBlogPosts(limit = 5) {
  const rows = await (await getDb())
    .select({
      post: blogPosts,
      authorName: users.name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(publishedBlogCondition())
    .orderBy(desc(blogPosts.viewCount), desc(blogPosts.publishedAt))
    .limit(Math.max(1, Math.min(24, limit)));
  return rows.map((row) => serializeBlogSummary(row.post, row.authorName));
}

export async function listRelatedBlogPosts(options: {
  slug: string;
  category?: string;
  limit?: number;
}) {
  const limit = Math.max(1, Math.min(12, options.limit ?? 3));
  const slug = options.slug.trim();
  const category = options.category?.trim();
  const db = await getDb();

  const sameCategory = category
    ? await db
        .select({
          post: blogPosts,
          authorName: users.name,
        })
        .from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .where(
          publishedBlogCondition(
            eq(blogPosts.category, category),
            ne(blogPosts.slug, slug),
          ),
        )
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit)
    : [];

  const posts = sameCategory.map((row) =>
    serializeBlogSummary(row.post, row.authorName),
  );
  if (posts.length >= limit) return posts;

  const exclude = new Set([slug, ...posts.map((p) => p.slug)]);
  const backfill = await db
    .select({
      post: blogPosts,
      authorName: users.name,
    })
    .from(blogPosts)
    .leftJoin(users, eq(blogPosts.authorId, users.id))
    .where(publishedBlogCondition(ne(blogPosts.slug, slug)))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit + exclude.size);

  for (const row of backfill) {
    if (exclude.has(row.post.slug)) continue;
    posts.push(serializeBlogSummary(row.post, row.authorName));
    if (posts.length >= limit) break;
  }

  return posts;
}

export async function listPublishedBlogCategories() {
  const rows = await (await getDb())
    .select({
      name: blogPosts.category,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(blogPosts)
    .where(publishedBlogCondition())
    .groupBy(blogPosts.category)
    .orderBy(desc(sql`count(*)`), asc(blogPosts.category));
  return rows.map((row) => ({ name: row.name, count: row.count }));
}

export async function incrementBlogPostViewCount(slug: string) {
  await (await getDb()).run(sql`
    UPDATE blog_posts
    SET view_count = view_count + 1
    WHERE slug = ${slug}
      AND status = 'PUBLISHED'
      AND published_at IS NOT NULL
  `);
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
  coverImageUrl?: string | null;
  tags?: string[];
  isFeatured?: boolean;
  isCompanyNews?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  readTimeMinutes?: number | null;
}) {
  const [row] = await (await getDb())
    .insert(blogPosts)
    .values(data)
    .returning();
  await scheduleRagSync("blog_posts");
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
      | "coverImageUrl"
      | "tags"
      | "isFeatured"
      | "isCompanyNews"
      | "metaTitle"
      | "metaDescription"
      | "readTimeMinutes"
    >
  >,
) {
  const [row] = await (await getDb())
    .update(blogPosts)
    .set(data)
    .where(eq(blogPosts.id, id))
    .returning();
  if (row) await scheduleRagSync("blog_posts");
  return row;
}

export async function deleteBlogPostAdmin(id: string) {
  const [row] = await (await getDb())
    .delete(blogPosts)
    .where(eq(blogPosts.id, id))
    .returning();
  if (row) await scheduleRagSync("blog_posts");
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
  if (row) await scheduleRagSync("erp_modules");
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
  await scheduleRagSync("erp_modules");
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
  await scheduleRagSync("industry_domains");
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
  if (row) await scheduleRagSync("industry_domains");
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
  await scheduleRagSync("industry_domains");
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
      if (pageKey === FAQ_PAGE_KEY_CONTACT) {
        return CONTACT_FAQS_DEFAULTS.map(faqFromDefault);
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
      if (pageKey === FAQ_PAGE_KEY_CONTACT) {
        return CONTACT_FAQS_DEFAULTS.map(faqFromDefault);
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
  await scheduleRagSync("faqs");
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
  if (row) await scheduleRagSync("faqs");
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
  await scheduleRagSync("faqs");
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

// ─── Chatbot knowledge (bot-only, never on the public site) ───────────────────

export async function listChatbotKnowledgeAdmin() {
  const rows = await (await getDb())
    .select()
    .from(chatbotKnowledge)
    .orderBy(asc(chatbotKnowledge.sortOrder));
  return rows.map(serializeChatbotKnowledge);
}

export async function createChatbotKnowledgeAdmin(
  data: CreateChatbotKnowledgeInput,
) {
  const db = await getDb();
  let sortOrder = data.sortOrder;
  if (sortOrder === undefined) {
    const [result] = await db
      .select({ maxSort: max(chatbotKnowledge.sortOrder) })
      .from(chatbotKnowledge);
    sortOrder = (result?.maxSort ?? -1) + 1;
  }
  const [row] = await db
    .insert(chatbotKnowledge)
    .values({
      title: data.title,
      body: data.body,
      category: data.category ?? null,
      enabled: data.enabled ?? true,
      sortOrder,
    })
    .returning();
  await scheduleRagSync("chatbot_knowledge");
  return serializeChatbotKnowledge(row);
}

export async function updateChatbotKnowledgeAdmin(
  id: string,
  data: UpdateChatbotKnowledgeInput,
) {
  const [row] = await (await getDb())
    .update(chatbotKnowledge)
    .set(data)
    .where(eq(chatbotKnowledge.id, id))
    .returning();
  if (row) await scheduleRagSync("chatbot_knowledge");
  if (!row) return null;
  return serializeChatbotKnowledge(row);
}

export async function deleteChatbotKnowledgeAdmin(id: string) {
  const [existing] = await (await getDb())
    .select({ id: chatbotKnowledge.id })
    .from(chatbotKnowledge)
    .where(eq(chatbotKnowledge.id, id))
    .limit(1);
  if (!existing) return false;
  await (await getDb())
    .delete(chatbotKnowledge)
    .where(eq(chatbotKnowledge.id, id));
  await scheduleRagSync("chatbot_knowledge");
  return true;
}

export async function getChatbotKnowledgeByIdAdmin(id: string) {
  const [row] = await (await getDb())
    .select()
    .from(chatbotKnowledge)
    .where(eq(chatbotKnowledge.id, id))
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
    metaTitle: DEMO_PAGE_CONTENT_DEFAULTS.metaTitle,
    metaDescription: DEMO_PAGE_CONTENT_DEFAULTS.metaDescription,
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
  await scheduleRagSync("demo_page_content");
  return serializeDemoPageContent(row);
}

export async function getPageHeroContent(
  pageKey: PageHeroPageKey,
): Promise<PageHeroContent> {
  try {
    const [row] = await (await getDb())
      .select()
      .from(pageHeroContent)
      .where(eq(pageHeroContent.pageKey, pageKey))
      .limit(1);
    if (!row) return pageHeroFromDefaults(pageKey);
    return serializePageHeroContent(row);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] page_hero_content missing — using defaults (run db:migrate:local)",
      );
      return pageHeroFromDefaults(pageKey);
    }
    throw err;
  }
}

export async function upsertPageHeroContentAdmin(
  pageKey: PageHeroPageKey,
  data: UpsertPageHeroContentInput,
): Promise<PageHeroContent> {
  const [row] = await (await getDb())
    .insert(pageHeroContent)
    .values({
      pageKey,
      content: data,
    })
    .onConflictDoUpdate({
      target: pageHeroContent.pageKey,
      set: { content: data },
    })
    .returning();
  return serializePageHeroContent(row);
}

// ─── About page content ──────────────────────────────────────────────────────

export async function getAboutStory(): Promise<AboutStory> {
  try {
    const [row] = await (await getDb())
      .select()
      .from(aboutStory)
      .where(eq(aboutStory.id, ABOUT_STORY_ID))
      .limit(1);
    if (!row) return aboutStoryFromDefaults();
    return serializeAboutStory(row);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] about_story missing — using defaults (run db:migrate:local)",
      );
      return aboutStoryFromDefaults();
    }
    throw err;
  }
}

export async function getAboutStoryAdmin() {
  try {
    const [row] = await (await getDb())
      .select()
      .from(aboutStory)
      .where(eq(aboutStory.id, ABOUT_STORY_ID))
      .limit(1);
    if (!row) {
      return { ...aboutStoryFromDefaults(), imageKey: null as string | null };
    }
    return {
      ...serializeAboutStory(row),
      imageKey: row.imageKey,
    };
  } catch (err) {
    if (isMissingRelationError(err)) {
      return { ...aboutStoryFromDefaults(), imageKey: null as string | null };
    }
    throw err;
  }
}

export async function upsertAboutStoryAdmin(
  data: UpsertAboutStoryInput,
): Promise<AboutStory & { imageKey: string | null }> {
  const values = {
    id: ABOUT_STORY_ID,
    imageKey:
      data.imageKey === undefined
        ? ABOUT_STORY_DEFAULTS.imageKey
        : data.imageKey,
    imageAlt: data.imageAlt,
    badge: data.badge,
    title: data.title,
    paragraph1: data.paragraph1,
    paragraph2: data.paragraph2,
    calloutIconKey: data.calloutIconKey,
    calloutTitle: data.calloutTitle,
    calloutBody: data.calloutBody,
    calloutLinkLabel: data.calloutLinkLabel,
    calloutLinkUrl: data.calloutLinkUrl,
    metaTitle: data.metaTitle ?? null,
    metaDescription: data.metaDescription ?? null,
  };

  const commonSet = {
    imageAlt: data.imageAlt,
    badge: data.badge,
    title: data.title,
    paragraph1: data.paragraph1,
    paragraph2: data.paragraph2,
    calloutIconKey: data.calloutIconKey,
    calloutTitle: data.calloutTitle,
    calloutBody: data.calloutBody,
    calloutLinkLabel: data.calloutLinkLabel,
    calloutLinkUrl: data.calloutLinkUrl,
    metaTitle: data.metaTitle ?? null,
    metaDescription: data.metaDescription ?? null,
  };
  const setValues =
    data.imageKey === undefined
      ? commonSet
      : { imageKey: data.imageKey, ...commonSet };

  const [row] = await (await getDb())
    .insert(aboutStory)
    .values(values)
    .onConflictDoUpdate({
      target: aboutStory.id,
      set: setValues,
    })
    .returning();
  await scheduleRagSync("about_story");
  return {
    ...serializeAboutStory(row),
    imageKey: row.imageKey,
  };
}

function aboutValueFromDefault(
  d: (typeof ABOUT_VALUES_DEFAULTS)[number],
  index: number,
): AboutValue {
  return {
    id: `default-about-value-${index}`,
    title: d.title,
    description: d.description,
    sortOrder: d.sortOrder,
  };
}

export async function listPublishedAboutValues(): Promise<AboutValue[]> {
  try {
    const rows = await (await getDb())
      .select()
      .from(aboutValues)
      .where(eq(aboutValues.published, true))
      .orderBy(asc(aboutValues.sortOrder));
    if (rows.length === 0) {
      return ABOUT_VALUES_DEFAULTS.map(aboutValueFromDefault);
    }
    return rows.map(serializeAboutValue);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] about_values missing — using defaults (run db:migrate:local)",
      );
      return ABOUT_VALUES_DEFAULTS.map(aboutValueFromDefault);
    }
    throw err;
  }
}

export async function listAboutValuesAdmin() {
  const rows = await (await getDb())
    .select()
    .from(aboutValues)
    .orderBy(asc(aboutValues.sortOrder));
  return rows.map((row) => ({
    ...serializeAboutValue(row),
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function createAboutValueAdmin(data: CreateAboutValueInput) {
  const db = await getDb();
  let sortOrder = data.sortOrder;
  if (sortOrder === undefined) {
    const [result] = await db
      .select({ maxSort: max(aboutValues.sortOrder) })
      .from(aboutValues);
    sortOrder = (result?.maxSort ?? -1) + 1;
  }
  const [row] = await db
    .insert(aboutValues)
    .values({
      id: createId(),
      title: data.title,
      description: data.description,
      published: data.published ?? true,
      sortOrder,
    })
    .returning();
  return {
    ...serializeAboutValue(row),
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateAboutValueAdmin(
  id: string,
  data: UpdateAboutValueInput,
) {
  const [row] = await (await getDb())
    .update(aboutValues)
    .set(data)
    .where(eq(aboutValues.id, id))
    .returning();
  if (!row) return null;
  return {
    ...serializeAboutValue(row),
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function deleteAboutValueAdmin(id: string) {
  const [existing] = await (await getDb())
    .select({ id: aboutValues.id })
    .from(aboutValues)
    .where(eq(aboutValues.id, id))
    .limit(1);
  if (!existing) return false;
  await (await getDb()).delete(aboutValues).where(eq(aboutValues.id, id));
  return true;
}

export async function getAboutValueByIdAdmin(id: string) {
  const [row] = await (await getDb())
    .select()
    .from(aboutValues)
    .where(eq(aboutValues.id, id))
    .limit(1);
  return row ?? null;
}

export async function reorderAboutValuesAdmin(ids: string[]) {
  const db = await getDb();
  await Promise.all(
    ids.map((id, index) =>
      db
        .update(aboutValues)
        .set({ sortOrder: index })
        .where(eq(aboutValues.id, id)),
    ),
  );
  return listAboutValuesAdmin();
}

export async function getAboutFinalCta(): Promise<HomeFinalCta> {
  try {
    const [row] = await (await getDb())
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, ABOUT_FINAL_CTA_KEY))
      .limit(1);
    return serializeAboutFinalCta(row?.value);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] site_settings missing — using about CTA defaults",
      );
      return { ...ABOUT_FINAL_CTA_DEFAULTS };
    }
    throw err;
  }
}

export async function upsertAboutFinalCtaAdmin(
  data: UpsertAboutFinalCtaInput,
): Promise<HomeFinalCta> {
  const value = JSON.stringify(data);
  await (await getDb())
    .insert(siteSettings)
    .values({ key: ABOUT_FINAL_CTA_KEY, value })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value },
    });
  return serializeAboutFinalCta(value);
}

export async function getAboutPageContent(): Promise<AboutPageContent> {
  const [hero, story, values, cta] = await Promise.all([
    getPageHeroContent(PAGE_HERO_KEY_ABOUT),
    getAboutStory(),
    listPublishedAboutValues(),
    getAboutFinalCta(),
  ]);
  return { hero, story, values, cta };
}

// ─── Contact page CMS ────────────────────────────────────────────────────────

function contactSupportFromDefaults(): ContactSupportContent {
  return {
    tag: CONTACT_SUPPORT_CONTENT_DEFAULTS.tag,
    title: CONTACT_SUPPORT_CONTENT_DEFAULTS.title,
    description: CONTACT_SUPPORT_CONTENT_DEFAULTS.description,
    knowledgeBaseLabel: CONTACT_SUPPORT_CONTENT_DEFAULTS.knowledgeBaseLabel,
    knowledgeBaseHref: CONTACT_SUPPORT_CONTENT_DEFAULTS.knowledgeBaseHref,
    cards: CONTACT_SUPPORT_CONTENT_DEFAULTS.cards,
    responseTimes: CONTACT_SUPPORT_CONTENT_DEFAULTS.responseTimes,
  };
}

function serializeContactSupport(
  row: InferSelectModel<typeof contactSupportContent>,
): ContactSupportContent {
  return {
    tag: row.tag,
    title: row.title,
    description: row.description,
    knowledgeBaseLabel:
      row.knowledgeBaseLabel ??
      CONTACT_SUPPORT_CONTENT_DEFAULTS.knowledgeBaseLabel,
    knowledgeBaseHref:
      row.knowledgeBaseHref ??
      CONTACT_SUPPORT_CONTENT_DEFAULTS.knowledgeBaseHref,
    cards: row.cards,
    responseTimes: row.responseTimes,
  };
}

export async function getContactSupportContent(): Promise<ContactSupportContent> {
  try {
    const [row] = await (await getDb())
      .select()
      .from(contactSupportContent)
      .where(eq(contactSupportContent.id, CONTACT_SUPPORT_CONTENT_ID))
      .limit(1);
    if (!row) return contactSupportFromDefaults();
    return serializeContactSupport(row);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] contact_support_content missing — using defaults",
      );
      return contactSupportFromDefaults();
    }
    throw err;
  }
}

export async function upsertContactSupportContentAdmin(
  data: UpsertContactSupportContentInput,
): Promise<ContactSupportContent> {
  const [row] = await (await getDb())
    .insert(contactSupportContent)
    .values({
      id: CONTACT_SUPPORT_CONTENT_ID,
      ...data,
    })
    .onConflictDoUpdate({
      target: contactSupportContent.id,
      set: data,
    })
    .returning();
  await scheduleRagSync("contact_support_content");
  return serializeContactSupport(row);
}

function contactPageFromDefaults(): ContactPageContent {
  return {
    sideTitle: CONTACT_PAGE_CONTENT_DEFAULTS.sideTitle,
    sideDescription: CONTACT_PAGE_CONTENT_DEFAULTS.sideDescription,
    formFieldOptions: CONTACT_PAGE_CONTENT_DEFAULTS.formFieldOptions,
    faqTag: CONTACT_PAGE_CONTENT_DEFAULTS.faqTag,
    faqTitle: CONTACT_PAGE_CONTENT_DEFAULTS.faqTitle,
    faqDescription: CONTACT_PAGE_CONTENT_DEFAULTS.faqDescription,
    metaTitle: CONTACT_PAGE_CONTENT_DEFAULTS.metaTitle,
    metaDescription: CONTACT_PAGE_CONTENT_DEFAULTS.metaDescription,
  };
}

function serializeContactPage(
  row: InferSelectModel<typeof contactPageContent>,
): ContactPageContent {
  return {
    sideTitle: row.sideTitle,
    sideDescription: row.sideDescription,
    formFieldOptions: row.formFieldOptions,
    faqTag: row.faqTag,
    faqTitle: row.faqTitle,
    faqDescription: row.faqDescription,
    metaTitle: row.metaTitle ?? CONTACT_PAGE_CONTENT_DEFAULTS.metaTitle,
    metaDescription:
      row.metaDescription ?? CONTACT_PAGE_CONTENT_DEFAULTS.metaDescription,
  };
}

export async function getContactPageContent(): Promise<ContactPageContent> {
  try {
    const [row] = await (await getDb())
      .select()
      .from(contactPageContent)
      .where(eq(contactPageContent.id, CONTACT_PAGE_CONTENT_ID))
      .limit(1);
    if (!row) return contactPageFromDefaults();
    return serializeContactPage(row);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn(
        "[content-db] contact_page_content missing — using defaults",
      );
      return contactPageFromDefaults();
    }
    throw err;
  }
}

export async function upsertContactPageContentAdmin(
  data: UpsertContactPageContentInput,
): Promise<ContactPageContent> {
  const [row] = await (await getDb())
    .insert(contactPageContent)
    .values({
      id: CONTACT_PAGE_CONTENT_ID,
      ...data,
    })
    .onConflictDoUpdate({
      target: contactPageContent.id,
      set: data,
    })
    .returning();
  return serializeContactPage(row);
}

function serializeContactChannel(
  row: InferSelectModel<typeof contactChannels>,
): ContactChannel {
  return {
    id: row.id,
    type: row.type,
    label: row.label,
    value: row.value,
    iconKey: row.iconKey,
    sortOrder: row.sortOrder,
    published: row.published,
  };
}

export async function listPublishedContactChannels(): Promise<ContactChannel[]> {
  try {
    const rows = await (await getDb())
      .select()
      .from(contactChannels)
      .where(eq(contactChannels.published, true))
      .orderBy(asc(contactChannels.sortOrder));
    if (rows.length === 0) {
      return CONTACT_CHANNELS_DEFAULTS.map((d, i) => ({
        id: `default-channel-${i}`,
        ...d,
      }));
    }
    return rows.map(serializeContactChannel);
  } catch (err) {
    if (isMissingRelationError(err)) {
      console.warn("[content-db] contact_channels missing — using defaults");
      return CONTACT_CHANNELS_DEFAULTS.map((d, i) => ({
        id: `default-channel-${i}`,
        ...d,
      }));
    }
    throw err;
  }
}

export async function listContactChannelsAdmin(): Promise<ContactChannel[]> {
  const rows = await (await getDb())
    .select()
    .from(contactChannels)
    .orderBy(asc(contactChannels.sortOrder));
  return rows.map(serializeContactChannel);
}

export async function createContactChannelAdmin(
  data: CreateContactChannelInput,
): Promise<ContactChannel> {
  const [{ maxSort }] = await (await getDb())
    .select({ maxSort: max(contactChannels.sortOrder) })
    .from(contactChannels);
  const sortOrder = data.sortOrder ?? (maxSort ?? -1) + 1;
  const [row] = await (await getDb())
    .insert(contactChannels)
    .values({
      type: data.type,
      label: data.label,
      value: data.value,
      iconKey: data.iconKey,
      sortOrder,
      published: data.published ?? true,
    })
    .returning();
  return serializeContactChannel(row);
}

export async function updateContactChannelAdmin(
  id: string,
  data: UpdateContactChannelInput,
): Promise<ContactChannel | null> {
  const [row] = await (await getDb())
    .update(contactChannels)
    .set(data)
    .where(eq(contactChannels.id, id))
    .returning();
  return row ? serializeContactChannel(row) : null;
}

export async function deleteContactChannelAdmin(id: string): Promise<boolean> {
  const deleted = await (await getDb())
    .delete(contactChannels)
    .where(eq(contactChannels.id, id))
    .returning({ id: contactChannels.id });
  return deleted.length > 0;
}

export async function reorderContactChannelsAdmin(
  orderedIds: string[],
): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      (async () => {
        await (await getDb())
          .update(contactChannels)
          .set({ sortOrder: index })
          .where(eq(contactChannels.id, id));
      })(),
    ),
  );
}

// ─── Modules admin CRUD ──────────────────────────────────────────────────────

export async function listModulesAdmin() {
  const rows = await (await getDb())
    .select()
    .from(erpModules)
    .orderBy(asc(erpModules.sortOrder), asc(erpModules.name));
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    published: row.published,
    sortOrder: row.sortOrder,
    showInHeroOrbit: row.showInHeroOrbit,
    iconKey: row.iconKey,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getModuleAdminBySlug(slug: string) {
  const [row] = await (await getDb())
    .select()
    .from(erpModules)
    .where(eq(erpModules.slug, slug))
    .limit(1);
  if (!row) return null;
  return {
    ...serializeModuleDetail(row),
    id: row.id,
    published: row.published,
    sortOrder: row.sortOrder,
    showInHeroOrbit: row.showInHeroOrbit,
    orbitRadius: row.orbitRadius,
    orbitTilt: row.orbitTilt,
    orbitPhase: row.orbitPhase,
    orbitSpeed: row.orbitSpeed,
    /** Raw DB image key (not mediaUrl-resolved) for admin editors. */
    imageKey: row.image,
    imageUrl: resolveMediaPath(row.image) ?? "",
    features: serializeFeatures(row.features),
    aboutContents: row.aboutContents,
    capabilities: row.capabilities ?? [],
    rolloutTag: row.rolloutTag,
    rolloutTitleTemplate: row.rolloutTitleTemplate,
    rolloutDescription: row.rolloutDescription,
    rolloutSteps: row.rolloutSteps ?? [],
    // Raw nullable CMS page-copy overrides — editors show blank = "using default".
    videoCtaTitle: row.videoCtaTitle,
    videoCtaDescription: row.videoCtaDescription,
    heroEyebrow: row.heroEyebrow,
    capabilitiesTag: row.capabilitiesTag,
    capabilitiesDescription: row.capabilitiesDescription,
    featuresTag: row.featuresTag,
    featuresSectionDescription: row.featuresSectionDescription,
    videoCtaButtonLabel: row.videoCtaButtonLabel,
    faqSectionTag: row.faqSectionTag,
    faqSectionTitleTemplate: row.faqSectionTitleTemplate,
    aboutSectionHeadings: row.aboutSectionHeadings,
    allAppsTag: row.allAppsTag,
    allAppsTitle: row.allAppsTitle,
    ctaHeadline: row.ctaHeadline,
    ctaPrimaryLabel: row.ctaPrimaryLabel,
    ctaPrimaryHref: row.ctaPrimaryHref,
    ctaSecondaryLabel: row.ctaSecondaryLabel,
    ctaSecondaryHref: row.ctaSecondaryHref,
    defaultImage: row.defaultImage,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  };
}

export async function createModuleAdmin(data: CreateModuleInput) {
  const [{ maxSort }] = await (await getDb())
    .select({ maxSort: max(erpModules.sortOrder) })
    .from(erpModules);
  const sortOrder = data.sortOrder ?? (maxSort ?? -1) + 1;
  const [row] = await (await getDb())
    .insert(erpModules)
    .values({
      slug: data.slug,
      name: data.name,
      shortDescription: data.shortDescription,
      image: data.image ?? null,
      highlights: data.highlights,
      bestFor: data.bestFor,
      cardTagline: data.cardTagline ?? null,
      iconKey: data.iconKey,
      videoUrl: data.videoUrl,
      videoCtaTitle: data.videoCtaTitle ?? null,
      videoCtaDescription: data.videoCtaDescription ?? null,
      heroHeadline: data.heroHeadline,
      heroSubheadline: data.heroSubheadline,
      heroCtaLabel: data.heroCtaLabel ?? null,
      aboutTitle: data.aboutTitle,
      aboutTag: data.aboutTag ?? null,
      aboutDescription: data.aboutDescription,
      aboutContents: (data.aboutContents as never) ?? null,
      featuresSectionTitle: data.featuresSectionTitle ?? null,
      features: data.features,
      capabilities: data.capabilities ?? [],
      rolloutTag:
        data.rolloutTag ?? DEFAULT_MODULE_ROLLOUT_SECTION.tag,
      rolloutTitleTemplate:
        data.rolloutTitleTemplate ??
        DEFAULT_MODULE_ROLLOUT_SECTION.titleTemplate,
      rolloutDescription:
        data.rolloutDescription ?? DEFAULT_MODULE_ROLLOUT_SECTION.description,
      rolloutSteps:
        data.rolloutSteps?.length
          ? data.rolloutSteps
          : [...DEFAULT_MODULE_ROLLOUT_STEPS],
      problems: (data.problems as never) ?? [],
      testimonialsSectionTag: data.testimonialsSectionTag ?? null,
      testimonialsSectionTitle: data.testimonialsSectionTitle ?? null,
      testimonialsSectionDescription:
        data.testimonialsSectionDescription ?? null,
      useCases: (data.useCases as never) ?? [],
      testimonials: (data.testimonials as never) ?? [],
      faqs: (data.faqs as never) ?? [],
      sortOrder,
      published: data.published ?? false,
      showInHeroOrbit: data.showInHeroOrbit ?? false,
      orbitRadius: data.orbitRadius ?? null,
      orbitTilt: data.orbitTilt ?? null,
      orbitPhase: data.orbitPhase ?? null,
      orbitSpeed: data.orbitSpeed ?? null,
    })
    .returning();
  await scheduleRagSync("erp_modules");
  return getModuleAdminBySlug(row.slug);
}

export async function updateModuleAdmin(slug: string, data: UpdateModuleInput) {
  const [existing] = await (await getDb())
    .select({ id: erpModules.id })
    .from(erpModules)
    .where(eq(erpModules.slug, slug))
    .limit(1);
  if (!existing) return null;

  const patch: Record<string, unknown> = { ...data };
  if ("aboutContents" in data) {
    patch.aboutContents = data.aboutContents as never;
  }
  if ("problems" in data) patch.problems = data.problems as never;
  if ("useCases" in data) patch.useCases = data.useCases as never;
  if ("testimonials" in data) patch.testimonials = data.testimonials as never;
  if ("faqs" in data) patch.faqs = data.faqs as never;

  const [row] = await (await getDb())
    .update(erpModules)
    .set(patch)
    .where(eq(erpModules.slug, slug))
    .returning();
  if (row) await scheduleRagSync("erp_modules");
  return row ? getModuleAdminBySlug(row.slug) : null;
}

export async function deleteModuleAdmin(slug: string): Promise<boolean> {
  const deleted = await (await getDb())
    .delete(erpModules)
    .where(eq(erpModules.slug, slug))
    .returning({ id: erpModules.id });
  if (deleted.length > 0) await scheduleRagSync("erp_modules");
  return deleted.length > 0;
}

export async function reorderModulesAdmin(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      (async () => {
        await (await getDb())
          .update(erpModules)
          .set({ sortOrder: index })
          .where(eq(erpModules.id, id));
      })(),
    ),
  );
  await scheduleRagSync("erp_modules");
}

// ─── Solutions admin CRUD ────────────────────────────────────────────────────

export async function listSolutionsAdmin() {
  const rows = await (await getDb())
    .select()
    .from(solutions)
    .orderBy(asc(solutions.sortOrder), asc(solutions.title));
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    audience: row.audience,
    published: row.published,
    sortOrder: row.sortOrder,
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getSolutionAdminBySlug(slug: string) {
  const [row] = await (await getDb())
    .select()
    .from(solutions)
    .where(eq(solutions.slug, slug))
    .limit(1);
  if (!row) return null;
  return {
    ...serializeSolutionDetail(row),
    id: row.id,
    published: row.published,
    sortOrder: row.sortOrder,
    // Raw nullable CMS page-copy overrides — editors show blank = "using default".
    heroEyebrow: row.heroEyebrow,
    heroImage: row.heroImage,
    heroImageUrl: resolveMediaPath(row.heroImage) ?? "",
    heroImageAlt: row.heroImageAlt,
    heroCaption: row.heroCaption,
    heroPrimaryCtaLabel: row.heroPrimaryCtaLabel,
    heroPrimaryCtaHref: row.heroPrimaryCtaHref,
    heroSecondaryCtaLabel: row.heroSecondaryCtaLabel,
    heroSecondaryCtaHref: row.heroSecondaryCtaHref,
    useCases: row.useCases ?? undefined,
    tabsIntroTag: row.tabsIntroTag,
    tabsIntroTitle: row.tabsIntroTitle,
    tabsIntroDescription: row.tabsIntroDescription,
    tabImageFallback: row.tabImageFallback,
    recommendedTag: row.recommendedTag,
    recommendedTitle: row.recommendedTitle,
    recommendedDescription: row.recommendedDescription,
    faqTag: row.faqTag,
    faqTitle: row.faqTitle,
    ctaEyebrow: row.ctaEyebrow,
    ctaHeadline: row.ctaHeadline,
    ctaDescription: row.ctaDescription,
    ctaPrimaryLabel: row.ctaPrimaryLabel,
    ctaPrimaryHref: row.ctaPrimaryHref,
    ctaSecondaryLabel: row.ctaSecondaryLabel,
    ctaSecondaryHref: row.ctaSecondaryHref,
    metaTitle: row.metaTitle,
    metaDescription: row.metaDescription,
  };
}

export async function createSolutionAdmin(data: CreateSolutionInput) {
  const [{ maxSort }] = await (await getDb())
    .select({ maxSort: max(solutions.sortOrder) })
    .from(solutions);
  const sortOrder = data.sortOrder ?? (maxSort ?? -1) + 1;
  const [row] = await (await getDb())
    .insert(solutions)
    .values({
      slug: data.slug,
      title: data.title,
      audience: data.audience,
      heroHeadline: data.heroHeadline,
      heroSubheadline: data.heroSubheadline,
      problems: (data.problems as never) ?? [],
      recommendedModules: data.recommendedModules,
      testimonial: (data.testimonial as never) ?? {
        quote: "",
        author: "",
        role: "",
      },
      solutionFaqs: (data.solutionFaqs as never) ?? [],
      useCases: (data.useCases as never) ?? null,
      sortOrder,
      published: data.published ?? false,
    })
    .returning();
  await scheduleRagSync("solutions");
  return getSolutionAdminBySlug(row.slug);
}

export async function updateSolutionAdmin(
  slug: string,
  data: UpdateSolutionInput,
) {
  const [existing] = await (await getDb())
    .select({ id: solutions.id })
    .from(solutions)
    .where(eq(solutions.slug, slug))
    .limit(1);
  if (!existing) return null;

  const patch: Record<string, unknown> = { ...data };
  if ("problems" in data) patch.problems = data.problems as never;
  if ("testimonial" in data) patch.testimonial = data.testimonial as never;
  if ("solutionFaqs" in data) patch.solutionFaqs = data.solutionFaqs as never;
  if ("useCases" in data) patch.useCases = data.useCases as never;

  const [row] = await (await getDb())
    .update(solutions)
    .set(patch)
    .where(eq(solutions.slug, slug))
    .returning();
  if (row) await scheduleRagSync("solutions");
  return row ? getSolutionAdminBySlug(row.slug) : null;
}

export async function deleteSolutionAdmin(slug: string): Promise<boolean> {
  const deleted = await (await getDb())
    .delete(solutions)
    .where(eq(solutions.slug, slug))
    .returning({ id: solutions.id });
  if (deleted.length > 0) await scheduleRagSync("solutions");
  return deleted.length > 0;
}

export async function reorderSolutionsAdmin(
  orderedIds: string[],
): Promise<void> {
  await Promise.all(
    orderedIds.map((id, index) =>
      (async () => {
        await (await getDb())
          .update(solutions)
          .set({ sortOrder: index })
          .where(eq(solutions.id, id));
      })(),
    ),
  );
  await scheduleRagSync("solutions");
}

