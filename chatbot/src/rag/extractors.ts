/**
 * Table-specific content extraction and normalization.
 *
 * Each extractor converts a raw D1 row into plain, RAG-friendly text that is
 * safe to embed (no sensitive columns, no SQL identifiers, no UI cruft).
 * JSON columns are flattened into readable text.
 * The `EXCLUDED_COLUMNS` policy from allowlist.ts is enforced by the caller
 * (the D1 reader), here we just shape what we use.
 *
 * Returns one or more "documents" per row — long rich records (like a module
 * with many FAQ entries + capabilities + use-cases) get split into
 * semantically meaningful sections rather than blindly chunked.
 */
import { parseJsonLoose } from "../lib/d1_reader.ts";
import type {
  ErpModuleRow,
  SolutionRow,
  PricingPlanRow,
  ComparisonFeatureRow,
  FaqRow,
  BlogPostRow,
  IndustryDomainRow,
  AboutStoryRow,
  DemoPageContentRow,
  ContactSupportContentRow,
  ChatbotKnowledgeRow,
} from "../lib/d1_reader.ts";

export interface Document {
  /** Human-readable context/heading shown in retrieval results and logs. */
  document_type: string;
  text: string;
}

export type RecordsBundle = Record<string, unknown[]>;

function asText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map((x) => String(x)).join(", ");
  return String(v);
}

function clean(s: unknown): string {
  return String(s ?? "").replace(/\s+/g, " ").trim();
}

function stripHtml(html: string): string {
  // Remove tags; keep the text content. Good enough for marketing copy.
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalize(value: unknown): string {
  let s = asText(value);
  if (s && /<[a-zA-Z/]/.test(s)) s = stripHtml(s);
  return clean(s);
}

// --- Simple list/section helpers ---

function listFromRaw(raw: unknown): string[] {
  const parsed = parseJsonLoose<unknown[]>(raw);
  if (Array.isArray(parsed)) {
    return parsed.map((x) => clean(asText(x))).filter(Boolean);
  }
  const s = asText(raw);
  if (!s) return [];
  // Some fields store "a; b; c" or "a, b, c"
  return s.split(/[;\n]/).map(clean).filter(Boolean);
}

function objectListFromRaw(raw: unknown, keys: string[]): string[] {
  const parsed = parseJsonLoose<Array<Record<string, unknown>>>(raw);
  if (!Array.isArray(parsed)) return [];
  const out: string[] = [];
  for (const item of parsed) {
    if (item && typeof item === "object") {
      const parts = keys
        .map((k) => {
          const val = item[k];
          const txt = clean(asText(val));
          return txt ? `${k.replace(/_/g, " ")}: ${txt}` : "";
        })
        .filter(Boolean);
      if (parts.length) out.push(parts.join(" "));
    }
  }
  return out;
}

// --- Per-table extractors ---

export function extractErpModules(records: unknown[]): Document[] {
  const docs: Document[] = [];
  for (const raw of records) {
    const r = raw as ErpModuleRow;
    const name = clean(r.name);
    if (!name) continue;

    const header = `${name} — ERP Module (${clean(r.slug)})`;

    // Overview
    docs.push({ document_type: "module_overview", text: `${header}\n${clean(r.hero_headline)} ${clean(r.hero_subheadline)}\n${clean(r.short_description)}\nBest for: ${clean(r.best_for)}` });

    const highlights = listFromRaw(r.highlights);
    if (highlights.length) {
      docs.push({ document_type: "module_highlights", text: `${header}\nHighlights:\n${highlights.map((h) => `- ${h}`).join("\n")}` });
    }

    const features = objectListFromRaw(r.features, ["title", "description"]);
    const capabilities = objectListFromRaw(r.capabilities, ["title", "description"]);
    const problems = objectListFromRaw(r.problems, ["title", "description"]);
    const useCases = objectListFromRaw(r.use_cases, ["title", "description"]);
    const testimonials = objectListFromRaw(r.testimonials, ["quote", "author", "role"]);
    const faqs = objectListFromRaw(r.faqs, ["question", "answer"]);

    if (features.length) {
      docs.push({ document_type: "module_features", text: `${header}\nFeatures:\n${features.map((f) => `- ${f}`).join("\n")}` });
    }
    if (capabilities.length) {
      docs.push({ document_type: "module_capabilities", text: `${header}\nCapabilities:\n${capabilities.map((c) => `- ${c}`).join("\n")}` });
    }
    if (problems.length) {
      docs.push({ document_type: "module_problems", text: `${header}\nProblems it solves:\n${problems.map((p) => `- ${p}`).join("\n")}` });
    }
    if (useCases.length) {
      docs.push({ document_type: "module_use_cases", text: `${header}\nUse cases:\n${useCases.map((u) => `- ${u}`).join("\n")}` });
    }
    if (testimonials.length) {
      docs.push({ document_type: "module_testimonials", text: `${header}\nTestimonials:\n${testimonials.map((t) => `- ${t}`).join("\n")}` });
    }
    if (faqs.length) {
      docs.push({ document_type: "module_faqs", text: `${header}\nFAQs:\n${faqs.map((f) => `Q: ...\nA: ...\n`).join("\n")}` });
    }
  }
  return docs;
}

export function extractSolutions(records: unknown[]): Document[] {
  const docs: Document[] = [];
  for (const raw of records) {
    const r = raw as SolutionRow;
    const title = clean(r.title);
    if (!title) continue;
    const header = `${title} — Solution for ${clean(r.audience)}`;

    docs.push({ document_type: "solution_overview", text: `${header}\n${clean(r.hero_headline)} ${clean(r.hero_subheadline)}` });

    const problems = objectListFromRaw(r.problems, ["title", "description"]);
    if (problems.length) {
      docs.push({ document_type: "solution_problems", text: `${header}\nProblems:\n${problems.map((p) => `- ${p}`).join("\n")}` });
    }
    const recMods = listFromRaw(r.recommended_modules);
    if (recMods.length) {
      docs.push({ document_type: "solution_recommended_modules", text: `${header}\nRecommended QTO ERP modules: ${recMods.join(", ")}` });
    }
    const faqs = objectListFromRaw(r.solution_faqs, ["question", "answer"]);
    if (faqs.length) {
      docs.push({ document_type: "solution_faqs", text: `${header}\nFAQs:\n${faqs.map((f) => `Q: ...\nA: ...\n`).join("\n")}` });
    }
    const useCases = objectListFromRaw(r.use_cases, ["title", "description"]);
    if (useCases.length) {
      docs.push({ document_type: "solution_use_cases", text: `${header}\nUse cases:\n${useCases.map((u) => `- ${u}`).join("\n")}` });
    }
    const t = objectListFromRaw(r.testimonial, ["quote", "author", "role"]);
    if (t.length) {
      docs.push({ document_type: "solution_testimonials", text: `${header}\nTestimonial: ${t[0]}` });
    }
  }
  return docs;
}

export function extractPricingPlans(records: unknown[]): Document[] {
  const docs: Document[] = [];
  for (const raw of records) {
    const r = raw as PricingPlanRow;
    const name = clean(r.name);
    if (!name) continue;
    const feats = listFromRaw(r.features);
    docs.push({
      document_type: "pricing_plan",
      text: `${name} Plan — ${clean(r.description)}\nMonthly: ${r.monthly_price_display}\nYearly: ${r.yearly_price_display}\nPopular: ${r.popular ? "yes" : "no"}\nFeatures:\n${feats.map((f) => `- ${f}`).join("\n")}`,
    });
  }
  return docs;
}

export function extractComparisonFeatures(records: unknown[]): Document[] {
  const docs: Document[] = [];
  for (const raw of records) {
    const r = raw as ComparisonFeatureRow;
    const feature = clean(r.feature);
    if (!feature) continue;
    docs.push({
      document_type: "pricing_comparison",
      text: `Feature comparison — ${feature}:\nStarter: ${clean(r.starter)}\nGrowth: ${clean(r.growth)}\nEnterprise: ${clean(r.enterprise)}`,
    });
  }
  return docs;
}

export function extractFaqs(records: unknown[]): Document[] {
  const docs: Document[] = [];
  for (const raw of records) {
    const r = raw as FaqRow;
    const q = clean(r.question);
    if (!q) continue;
    docs.push({
      document_type: "faq",
      text: `FAQ (${clean(r.page_key)}${r.category ? ` / ${clean(r.category)}` : ""})\nQ: ${q}\nA: ${clean(r.answer)}`,
    });
  }
  return docs;
}

export function extractBlogPosts(records: unknown[]): Document[] {
  const docs: Document[] = [];
  for (const raw of records) {
    const r = raw as BlogPostRow;
    const title = clean(stripHtml(r.title));
    if (!title) continue;
    const tags = listFromRaw(r.tags);
    const excerpt = clean(r.excerpt ? stripHtml(r.excerpt) : "");
    const bodyText = clean(stripHtml(r.content));
    docs.push({ document_type: "blog_post", text: `Blog: ${title} (${clean(r.category)})${tags.length ? ` — tags: ${tags.join(", ")}` : ""}\n${excerpt}\n${bodyText}` });
  }
  return docs;
}

export function extractIndustryDomains(records: unknown[]): Document[] {
  const docs: Document[] = [];
  for (const raw of records) {
    const r = raw as IndustryDomainRow;
    const name = clean(r.name);
    if (!name) continue;
    const leaders = listFromRaw(r.leaders);
    docs.push({
      document_type: "industry_domain",
      text: `${name} — industry domain (${r.systems_count} systems)\n${clean(r.description)}${leaders.length ? `\nNotable players: ${leaders.join(", ")}` : ""}`,
    });
  }
  return docs;
}

export function extractAboutStory(records: unknown[]): Document[] {
  const docs: Document[] = [];
  for (const raw of records) {
    const r = raw as AboutStoryRow;
    docs.push({
      document_type: "about_story",
      text: `About QTO ERP — ${clean(r.title)} (${clean(r.badge)})\n${clean(r.paragraph_1)}\n${clean(r.paragraph_2)}\nCallout: ${clean(r.callout_title)} — ${clean(r.callout_body)}`,
    });
  }
  return docs;
}

export function extractDemoPageContent(records: unknown[]): Document[] {
  const docs: Document[] = [];
  for (const raw of records) {
    const r = raw as DemoPageContentRow;
    docs.push({
      document_type: "demo_page",
      text: `QTO ERP Demo — ${clean(r.hero_title)}${r.hero_accent ? ` ${clean(r.hero_accent)}` : ""}\n${clean(r.hero_description)}\nProcess: ${clean(r.process_title)} — ${clean(r.process_description)}\nWhat to expect:\n${objectListFromRaw(r.what_to_expect, ["title", "description"]).join("\n")}\nBenefits:\n${objectListFromRaw(r.benefits, ["title", "description"]).join("\n")}`,
    });
  }
  return docs;
}

export function extractContactSupportContent(records: unknown[]): Document[] {
  const docs: Document[] = [];
  for (const raw of records) {
    const r = raw as ContactSupportContentRow;
    docs.push({
      document_type: "support_content",
      text: `QTO ERP Support — ${clean(r.title)}\n${clean(r.description)}\nSupport options:\n${objectListFromRaw(r.cards, ["title", "description"]).join("\n")}\nResponse times:\n${objectListFromRaw(r.response_times, ["label", "value"]).join("\n")}`,
    });
  }
  return docs;
}

/**
 * Dashboard-managed knowledge articles. Disabled rows produce no documents, so
 * a stale Vectorize hit for a disabled article resolves to "missing" instead of
 * being answered from.
 */
export function extractChatbotKnowledge(records: unknown[]): Document[] {
  const docs: Document[] = [];
  for (const raw of records) {
    const r = raw as ChatbotKnowledgeRow;
    if (!r.enabled || (r.enabled as unknown) === "0") continue;
    const title = clean(r.title);
    if (!title) continue;
    const category = clean(r.category);
    // Keep paragraph breaks in the body so the chunker can split on them.
    const body = (typeof r.body === "string" && /<[a-zA-Z/]/.test(r.body) ? stripHtml(r.body) : asText(r.body))
      .replace(/[ \t]+/g, " ")
      .replace(/ ?\n ?/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (!body) continue;
    docs.push({
      document_type: "chatbot_knowledge",
      text: `Chatbot knowledge — ${title}${category ? ` / ${category}` : ""}\n${body}`,
    });
  }
  return docs;
}

export function extractAll(bundle: RecordsBundle): Document[] {
  return [
    ...extractErpModules(bundle.erp_modules ?? []),
    ...extractSolutions(bundle.solutions ?? []),
    ...extractPricingPlans(bundle.pricing_plans ?? []),
    ...extractComparisonFeatures(bundle.comparison_features ?? []),
    ...extractFaqs(bundle.faqs ?? []),
    ...extractBlogPosts(bundle.blog_posts ?? []),
    ...extractIndustryDomains(bundle.industry_domains ?? []),
    ...extractAboutStory(bundle.about_story ?? []),
    ...extractDemoPageContent(bundle.demo_page_content ?? []),
    ...extractContactSupportContent(bundle.contact_support_content ?? []),
    ...extractChatbotKnowledge(bundle.chatbot_knowledge ?? []),
  ];
}

/**
 * Extract a single record into documents — used by incremental sync so we
 * only re-embed what changed.
 */
export function extractSingleRecord(table: string, raw: unknown): Document[] {
  switch (table) {
    case "erp_modules":
      return extractErpModules([raw]);
    case "solutions":
      return extractSolutions([raw]);
    case "pricing_plans":
      return extractPricingPlans([raw]);
    case "comparison_features":
      return extractComparisonFeatures([raw]);
    case "faqs":
      return extractFaqs([raw]);
    case "blog_posts":
      return extractBlogPosts([raw]);
    case "industry_domains":
      return extractIndustryDomains([raw]);
    case "about_story":
      return extractAboutStory([raw]);
    case "demo_page_content":
      return extractDemoPageContent([raw]);
    case "contact_support_content":
      return extractContactSupportContent([raw]);
    case "chatbot_knowledge":
      return extractChatbotKnowledge([raw]);
    default:
      return [];
  }
}
