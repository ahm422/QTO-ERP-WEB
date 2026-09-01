import { z } from "zod";

/** Optional CMS copy override: trimmed, capped, nullable (null/empty = use code default). */
const overrideText = (max: number) =>
  z.string().trim().max(max).nullable().optional();

/** Link override: relative ("/demo") or absolute http(s) URL. */
const overrideHref = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v), {
    message: "Must be a relative path (/…) or an absolute http(s) URL",
  })
  .nullable()
  .optional();

const solutionBaseSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case"),
  title: z.string().trim().min(1).max(120),
  audience: z.string().trim().min(1).max(200),
  heroHeadline: z.string().trim().min(1).max(200),
  heroSubheadline: z.string().trim().min(1).max(500),
  problems: z.unknown(),
  recommendedModules: z.array(z.string().trim().min(1).max(80)).max(40),
  testimonial: z.unknown(),
  solutionFaqs: z.unknown(),
  useCases: z.unknown().nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  published: z.boolean().optional(),
  // ── CMS page-copy overrides (Phase 2) — all optional, null/"" = code default. ──
  heroEyebrow: overrideText(80),
  heroImage: overrideText(300),
  heroImageAlt: overrideText(200),
  heroCaption: overrideText(200),
  heroPrimaryCtaLabel: overrideText(80),
  heroPrimaryCtaHref: overrideHref,
  heroSecondaryCtaLabel: overrideText(80),
  heroSecondaryCtaHref: overrideHref,
  tabsIntroTag: overrideText(80),
  tabsIntroTitle: overrideText(200),
  tabsIntroDescription: overrideText(500),
  tabImageFallback: overrideText(300),
  recommendedTag: overrideText(80),
  recommendedTitle: overrideText(200),
  recommendedDescription: overrideText(500),
  faqTag: overrideText(80),
  faqTitle: overrideText(200),
  ctaEyebrow: overrideText(80),
  ctaHeadline: overrideText(200),
  ctaDescription: overrideText(500),
  ctaPrimaryLabel: overrideText(80),
  ctaPrimaryHref: overrideHref,
  ctaSecondaryLabel: overrideText(80),
  ctaSecondaryHref: overrideHref,
  metaTitle: overrideText(200),
  metaDescription: overrideText(500),
});

export const createSolutionSchema = solutionBaseSchema.strict();
export const updateSolutionSchema = solutionBaseSchema.partial().strict();

export const reorderSolutionsSchema = z
  .object({
    orderedIds: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

export type CreateSolutionInput = z.infer<typeof createSolutionSchema>;
export type UpdateSolutionInput = z.infer<typeof updateSolutionSchema>;
