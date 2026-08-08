import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { AboutContentsType } from "@/types/about";
import type { FAQsType } from "@/types/faq";
import type { FeaturesType } from "@/types/feature";
import type { ProblemsType } from "@/types/problem";
import type {
  SolutionFAQType,
  SolutionProblem,
  SolutionUseCase,
} from "@/types/solution";
import type { TestimonialsType, TestimonialType } from "@/types/testimonial";
import type { UseCasesType } from "@/types/useCase";
import {
  blogPostStatuses,
  demoVideoStatuses,
  leadStatuses,
  roles,
} from "./enums";

export const users = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name"),
    role: text("role", { enum: roles }).notNull().default("ADMIN"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [index("users_email_idx").on(t.email)],
);

export const refreshTokens = sqliteTable(
  "refresh_tokens",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    revokedAt: integer("revoked_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    userAgent: text("user_agent"),
    ip: text("ip"),
  },
  (t) => [
    index("refresh_tokens_user_id_idx").on(t.userId),
    index("refresh_tokens_token_hash_idx").on(t.tokenHash),
  ],
);

export const blogPosts = sqliteTable(
  "blog_posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    status: text("status", { enum: blogPostStatuses })
      .notNull()
      .default("DRAFT"),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("blog_posts_slug_idx").on(t.slug),
    index("blog_posts_status_idx").on(t.status),
    index("blog_posts_published_at_idx").on(t.publishedAt),
    index("blog_posts_author_id_idx").on(t.authorId),
  ],
);

export const contactInquiries = sqliteTable(
  "contact_inquiries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    subject: text("subject").notNull(),
    companySize: text("company_size"),
    message: text("message").notNull(),
    status: text("status", { enum: leadStatuses }).notNull().default("NEW"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("contact_inquiries_email_idx").on(t.email),
    index("contact_inquiries_status_idx").on(t.status),
    index("contact_inquiries_created_at_idx").on(t.createdAt),
  ],
);

export const demoRequests = sqliteTable(
  "demo_requests",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    country: text("country").notNull(),
    company: text("company"),
    businessType: text("business_type").notNull(),
    status: text("status", { enum: leadStatuses }).notNull().default("NEW"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("demo_requests_email_idx").on(t.email),
    index("demo_requests_status_idx").on(t.status),
    index("demo_requests_created_at_idx").on(t.createdAt),
  ],
);

export const newsletterSubscribers = sqliteTable(
  "newsletter_subscribers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    email: text("email").notNull().unique(),
    subscribedAt: integer("subscribed_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    unsubscribedAt: integer("unsubscribed_at", { mode: "timestamp" }),
  },
  (t) => [index("newsletter_subscribers_email_idx").on(t.email)],
);

export const erpModules = sqliteTable(
  "erp_modules",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    shortDescription: text("short_description").notNull(),
    image: text("image"),
    highlights: text("highlights", { mode: "json" })
      .notNull()
      .$type<string[]>(),
    bestFor: text("best_for").notNull(),
    cardTagline: text("card_tagline"),
    iconKey: text("icon_key").notNull(),
    videoUrl: text("video_url").notNull(),
    videoCtaTitle: text("video_cta_title"),
    videoCtaDescription: text("video_cta_description"),
    heroHeadline: text("hero_headline").notNull(),
    heroSubheadline: text("hero_subheadline").notNull(),
    heroCtaLabel: text("hero_cta_label"),
    aboutTitle: text("about_title").notNull(),
    aboutTag: text("about_tag"),
    aboutDescription: text("about_description", { mode: "json" })
      .notNull()
      .$type<string[]>()
      .default([]),
    aboutContents: text("about_contents", { mode: "json" }).$type<
      AboutContentsType | null
    >(),
    featuresSectionTitle: text("features_section_title"),
    features: text("features", { mode: "json" })
      .notNull()
      .$type<FeaturesType>(),
    problems: text("problems", { mode: "json" })
      .notNull()
      .$type<ProblemsType>(),
    testimonialsSectionTag: text("testimonials_section_tag"),
    testimonialsSectionTitle: text("testimonials_section_title"),
    testimonialsSectionDescription: text("testimonials_section_description"),
    useCases: text("use_cases", { mode: "json" })
      .notNull()
      .$type<UseCasesType>(),
    testimonials: text("testimonials", { mode: "json" })
      .notNull()
      .$type<TestimonialsType>(),
    faqs: text("faqs", { mode: "json" }).notNull().$type<FAQsType>(),
    orbitRadius: real("orbit_radius"),
    orbitTilt: real("orbit_tilt"),
    orbitPhase: real("orbit_phase"),
    orbitSpeed: real("orbit_speed"),
    showInHeroOrbit: integer("show_in_hero_orbit", { mode: "boolean" })
      .notNull()
      .default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("erp_modules_slug_idx").on(t.slug),
    index("erp_modules_published_idx").on(t.published),
    index("erp_modules_sort_order_idx").on(t.sortOrder),
  ],
);

export const solutions = sqliteTable(
  "solutions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    audience: text("audience").notNull(),
    heroHeadline: text("hero_headline").notNull(),
    heroSubheadline: text("hero_subheadline").notNull(),
    problems: text("problems", { mode: "json" })
      .notNull()
      .$type<SolutionProblem[]>(),
    recommendedModules: text("recommended_modules", { mode: "json" })
      .notNull()
      .$type<string[]>(),
    testimonial: text("testimonial", { mode: "json" })
      .notNull()
      .$type<TestimonialType>(),
    solutionFaqs: text("solution_faqs", { mode: "json" })
      .notNull()
      .$type<SolutionFAQType[]>(),
    useCases: text("use_cases", { mode: "json" }).$type<
      SolutionUseCase[] | null
    >(),
    sortOrder: integer("sort_order").notNull().default(0),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("solutions_slug_idx").on(t.slug),
    index("solutions_published_idx").on(t.published),
    index("solutions_sort_order_idx").on(t.sortOrder),
  ],
);

export const comparisonFeatures = sqliteTable(
  "comparison_features",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    feature: text("feature").notNull().unique(),
    starter: text("starter").notNull(),
    growth: text("growth").notNull(),
    enterprise: text("enterprise").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("comparison_features_sort_order_idx").on(t.sortOrder),
    index("comparison_features_published_idx").on(t.published),
  ],
);

export const pricingPlans = sqliteTable(
  "pricing_plans",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    monthlyPriceDisplay: integer("monthly_price_display").notNull(),
    yearlyPriceDisplay: integer("yearly_price_display").notNull(),
    popular: integer("popular", { mode: "boolean" }).notNull().default(false),
    features: text("features", { mode: "json" })
      .notNull()
      .$type<string[]>(),
    cta: text("cta").notNull(),
    stripePriceIdMonthly: text("stripe_price_id_monthly"),
    stripePriceIdYearly: text("stripe_price_id_yearly"),
    sortOrder: integer("sort_order").notNull().default(0),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("pricing_plans_slug_idx").on(t.slug),
    index("pricing_plans_published_idx").on(t.published),
    index("pricing_plans_sort_order_idx").on(t.sortOrder),
  ],
);

export const demoVideos = sqliteTable(
  "demo_videos",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    objectKey: text("object_key").notNull().unique(),
    contentType: text("content_type").notNull(),
    moduleSlug: text("module_slug"),
    status: text("status", { enum: demoVideoStatuses })
      .notNull()
      .default("DRAFT"),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("demo_videos_status_idx").on(t.status),
    index("demo_videos_published_at_idx").on(t.publishedAt),
    index("demo_videos_module_slug_idx").on(t.moduleSlug),
  ],
);

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    stripeCustomerId: text("stripe_customer_id").notNull(),
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
    customerEmail: text("customer_email").notNull(),
    planSlug: text("plan_slug").notNull(),
    billingInterval: text("billing_interval").notNull(),
    status: text("status").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("subscriptions_customer_email_idx").on(t.customerEmail),
    index("subscriptions_stripe_customer_id_idx").on(t.stripeCustomerId),
  ],
);

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

/** Singleton marketing home hero copy (id = "default"). */
export const homeHero = sqliteTable("home_hero", {
  id: text("id").primaryKey(),
  eyebrowText: text("eyebrow_text").notNull(),
  titleLine1: text("title_line1").notNull(),
  titleAccent: text("title_accent").notNull(),
  subtitle: text("subtitle").notNull(),
  bullets: text("bullets", { mode: "json" }).notNull().$type<string[]>(),
  primaryCtaLabel: text("primary_cta_label").notNull(),
  primaryCtaUrl: text("primary_cta_url").notNull(),
  secondaryCtaLabel: text("secondary_cta_label").notNull(),
  secondaryCtaUrl: text("secondary_cta_url").notNull(),
  poweredByText: text("powered_by_text").notNull(),
  poweredByUrl: text("powered_by_url").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const navResources = sqliteTable(
  "nav_resources",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    label: text("label").notNull(),
    href: text("href").notNull(),
    iconKey: text("icon_key").notNull(),
    subtitle: text("subtitle"),
    sortOrder: integer("sort_order").notNull().default(0),
    visible: integer("visible", { mode: "boolean" }).notNull().default(true),
    external: integer("external", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("nav_resources_visible_idx").on(t.visible),
    index("nav_resources_sort_order_idx").on(t.sortOrder),
  ],
);

/** Home page "Trusted By" logos (optional R2 image; null = text-only). */
export const trustedLogos = sqliteTable(
  "trusted_logos",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    logoImageKey: text("logo_image_key"),
    linkUrl: text("link_url"),
    sortOrder: integer("sort_order").notNull().default(0),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("trusted_logos_published_idx").on(t.published),
    index("trusted_logos_sort_order_idx").on(t.sortOrder),
  ],
);

/** Home page stats strip rows. */
export const homeStats = sqliteTable(
  "home_stats",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    label: text("label").notNull(),
    value: real("value").notNull(),
    suffix: text("suffix").notNull(),
    iconKey: text("icon_key").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("home_stats_published_idx").on(t.published),
    index("home_stats_sort_order_idx").on(t.sortOrder),
  ],
);

/** Home page Built For audience cards. */
export const builtForCards = sqliteTable(
  "built_for_cards",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text("title").notNull(),
    description: text("description").notNull(),
    iconKey: text("icon_key").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    published: integer("published", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("built_for_cards_published_idx").on(t.published),
    index("built_for_cards_sort_order_idx").on(t.sortOrder),
  ],
);

/**
 * Shared home section header copy (one row per sectionKey).
 * Phase 5: add Integrated Modules / Ecosystems / FAQ / etc. as new rows here
 * instead of new singleton tables or scattered site_settings keys.
 */
export const homeSections = sqliteTable("home_sections", {
  sectionKey: text("section_key").primaryKey(),
  tag: text("tag").notNull(),
  title: text("title").notNull(),
  accent: text("accent").notNull(),
  description: text("description").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  blogPosts: many(blogPosts),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));
