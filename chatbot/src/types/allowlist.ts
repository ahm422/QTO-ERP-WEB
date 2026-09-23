/**
 * RAG source-table allowlist + per-table column policy.
 *
 * This module is the single source of truth for which D1 tables the chatbot
 * may read. Nothing else in the codebase is allowed to bypass this list.
 */

/**
 * Hard-coded allowlist of D1 tables the chatbot is permitted to read.
 *
 * NEVER add tables that contain PII, auth credentials, or payment data
 * (users, refresh_tokens, password_reset_tokens, subscriptions,
 * contact_inquiries, demo_requests, newsletter_subscribers) unless
 * explicitly directed by the team and with PII handled separately.
 */
export const RAG_ALLOWED_TABLES: readonly string[] = [
  "blog_posts",
  "industry_domains",
  "about_story",
  "demo_page_content",
  "contact_support_content",
  "erp_modules",
  "solutions",
  "faqs",
  "chatbot_knowledge",
] as const;

export type RagAllowedTable = (typeof RAG_ALLOWED_TABLES)[number];

/**
 * Columns that are never embedded, even when their table is allowed.
 * Defense-in-depth: even if a table is wrongly added to the allowlist,
 * these columns are stripped from embedded text before it reaches the
 * vector store or LLM.
 */
export const EXCLUDED_COLUMNS: Readonly<Record<string, readonly string[]>> = {
  blog_posts: ["view_count", "is_company_news", "is_featured", "email", "phone", "full_name", "name"],
  industry_domains: ["cta_label", "cta_url", "email", "phone", "full_name", "name"],
  about_story: ["image_key", "image_alt", "callout_icon_key", "email", "phone", "full_name", "name"],
  demo_page_content: ["email", "phone", "full_name", "name"],
  contact_support_content: ["email", "phone", "full_name", "name"],
  erp_modules: [
    "image",
    "icon_key",
    "video_url",
    "video_cta_title",
    "video_cta_description",
    "orbit_radius",
    "orbit_tilt",
    "orbit_phase",
    "orbit_speed",
    "show_in_hero_orbit",
    "email",
    "phone",
    "full_name",
    "name",
  ],
  solutions: ["hero_image", "hero_image_alt", "hero_caption", "email", "phone", "full_name", "name"],
  faqs: ["email", "phone", "full_name", "name"],
  chatbot_knowledge: ["email", "phone", "full_name", "name"],
};

/** Which tables carry a `published` flag that must be true to be indexed. */
export const PUBLISHED_ONLY_TABLES: ReadonlySet<string> = new Set([
  "blog_posts",
  "industry_domains",
  "erp_modules",
  "solutions",
  "faqs",
]);

export function isRagAllowedTable(table: string): boolean {
  return (RAG_ALLOWED_TABLES as readonly string[]).includes(table);
}

export function excludedColumnsFor(table: string): readonly string[] {
  return EXCLUDED_COLUMNS[table] ?? [];
}

export function isPublishedOnly(table: string): boolean {
  return PUBLISHED_ONLY_TABLES.has(table);
}
