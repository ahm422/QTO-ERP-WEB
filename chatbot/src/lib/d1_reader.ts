/**
 * Read-only D1 access layer for the chatbot.
 *
 * Safety rules:
 * - Only tables in RAG_ALLOWED_TABLES may be read (enforced via
 *   isRagAllowedTable at every entry point).
 * - Only SELECT statements are issued. No INSERT/UPDATE/DELETE/ALTER/DROP.
 * - Sensitive columns are excluded at extraction time (see extractors).
 * - No SQL identifier is ever built from user-supplied input.
 */
import { isRagAllowedTable } from "../types/allowlist.ts";

// ---------------------------------------------------------------------------
// Row shape types (only the fields that matter for RAG)
// ---------------------------------------------------------------------------

export interface ErpModuleRow {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  best_for: string;
  highlights: string | string[];
  hero_headline: string;
  hero_subheadline: string;
  about_title: string;
  about_description: string | string[];
  features: string | unknown;
  capabilities: string | unknown;
  problems: string | unknown;
  use_cases: string | unknown;
  testimonials: string | unknown;
  faqs: string | unknown;
  cta_headline?: string | null;
  published: number;
  updated_at?: Date | string | null;
  [key: string]: unknown;
}

export interface SolutionRow {
  id: string;
  slug: string;
  title: string;
  audience: string;
  hero_headline: string;
  hero_subheadline: string;
  problems: string | unknown;
  recommended_modules: string | string[];
  testimonial: string | unknown;
  solution_faqs: string | unknown;
  use_cases: string | unknown;
  published: number;
  updated_at?: Date | string | null;
  [key: string]: unknown;
}

export interface FaqRow {
  id: string;
  page_key: string;
  question: string;
  answer: string;
  category?: string | null;
  published: number;
  updated_at?: Date | string | null;
  [key: string]: unknown;
}

export interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt?: string | null;
  content: string;
  status: string;
  published_at?: Date | string | null;
  tags: string | string[];
  updated_at?: Date | string | null;
  [key: string]: unknown;
}

export interface IndustryDomainRow {
  id: string;
  slug: string;
  name: string;
  systems_count: number;
  description: string;
  leaders?: string | string[] | null;
  published: number;
  [key: string]: unknown;
}

export interface AboutStoryRow {
  id: string;
  badge: string;
  title: string;
  paragraph_1: string;
  paragraph_2: string;
  callout_title: string;
  callout_body: string;
  updated_at?: Date | string | null;
  [key: string]: unknown;
}

export interface DemoPageContentRow {
  id: string;
  hero_badge?: string | null;
  hero_title: string;
  hero_accent?: string | null;
  hero_description: string;
  process_title?: string | null;
  process_description?: string | null;
  what_to_expect?: string | unknown;
  side_title?: string | null;
  side_description?: string | null;
  benefits?: string | unknown;
  testimonial_quote?: string | null;
  updated_at?: Date | string | null;
  [key: string]: unknown;
}

export interface ContactSupportContentRow {
  id: string;
  tag?: string | null;
  title: string;
  description: string;
  cards?: string | unknown;
  response_times?: string | unknown;
  updated_at?: Date | string | null;
  [key: string]: unknown;
}

/** Dashboard-managed articles. Gated by `enabled`, not `published`. */
export interface ChatbotKnowledgeRow {
  id: string;
  title: string;
  body: string;
  category?: string | null;
  enabled: number | boolean;
  updated_at?: Date | string | null;
  [key: string]: unknown;
}

export type AnyRow =
  | ErpModuleRow
  | SolutionRow
  | FaqRow
  | BlogPostRow
  | IndustryDomainRow
  | AboutStoryRow
  | DemoPageContentRow
  | ContactSupportContentRow
  | ChatbotKnowledgeRow;

// ---------------------------------------------------------------------------
// Query helpers — each function issues one fixed, table-specific SELECT.
// ---------------------------------------------------------------------------

function normalizeRows(result: unknown): unknown[] {
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object" && Array.isArray((result as any).results)) {
    return (result as any).results;
  }
  return [];
}

/** Parse a JSON payload that may already be a parsed object or a JSON string. */
export function parseJsonLoose<T>(value: unknown): T | null {
  if (value == null) return null;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Fetch all RAG-relevant rows for the approved tables, filtered to
 * published content only. The table names are hard-coded here from the
 * allowlist — never constructed from user input.
 */
export async function fetchAllAllowedRecords(
  db: any,
): Promise<Record<string, AnyRow[]>> {
  const out: Record<string, AnyRow[]> = {};

  // Each entry: [table, sql] — SQL is written explicitly per table. No
  // string-concatenation of user-provided identifiers anywhere.
  const queries: Array<[string, string]> = [
    ["erp_modules", "SELECT * FROM erp_modules WHERE published = 1"],
    ["solutions", "SELECT * FROM solutions WHERE published = 1"],
    ["faqs", "SELECT * FROM faqs WHERE published = 1"],
    ["blog_posts", "SELECT * FROM blog_posts WHERE status = 'PUBLISHED' AND published_at IS NOT NULL"],
    ["industry_domains", "SELECT * FROM industry_domains WHERE published = 1"],
    ["about_story", "SELECT * FROM about_story"],
    ["demo_page_content", "SELECT * FROM demo_page_content"],
    ["contact_support_content", "SELECT * FROM contact_support_content"],
    ["chatbot_knowledge", "SELECT * FROM chatbot_knowledge WHERE enabled = 1"],
  ];

  for (const [table, sql] of queries) {
    const res = await db.prepare(sql).all();
    out[table] = normalizeRows(res) as AnyRow[];
  }

  return out;
}

/**
 * Fetch a single record by primary key — used by incremental sync to diff
 * content hashes without pulling the whole table.
 */
export async function fetchSingleRecord(
  db: any,
  table: string,
  id: string,
): Promise<AnyRow | null> {
  if (!isRagAllowedTable(table)) {
    throw new Error(`fetchSingleRecord: table "${table}" not in allowlist`);
  }
  // The Workers D1 binding requires parameters to be attached with `.bind(...)`;
  // calling `.all(param)` leaves `?` unbound and throws
  // "D1_ERROR: Wrong number of parameter bindings for SQL query."
  const res = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).all();
  const rows = normalizeRows(res);
  return rows.length > 0 ? (rows[0] as AnyRow) : null;
}
