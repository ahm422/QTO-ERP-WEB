import { z } from "zod";
import { ALLOWED_ROLLOUT_ICON_KEYS } from "@/lib/icon-map";

/** Optional CMS copy override: trimmed, capped, nullable (null/empty = use code default). */
const overrideText = (max: number) =>
  z.string().trim().max(max).nullable().optional();

/** Link override: relative ("/demo", "/blog?x=1") or absolute http(s) URL. */
const overrideHref = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v), {
    message: "Must be a relative path (/…) or an absolute http(s) URL",
  })
  .nullable()
  .optional();

const rolloutIconKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .refine(
    (key) => (ALLOWED_ROLLOUT_ICON_KEYS as readonly string[]).includes(key),
    { message: "Invalid rollout icon key" },
  );

const capabilitySchema = z.object({
  iconKey: z.string().trim().min(1).max(40).optional(),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  href: z.string().trim().max(300).optional(),
});

const rolloutStepSchema = z.object({
  step: z.number().int().min(1).max(20),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  iconKey: rolloutIconKeySchema,
});

const featureSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
  icon: z.string().trim().min(1).max(80),
  imageKey: z.string().trim().max(300).optional(),
});

const moduleBaseSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case"),
  name: z.string().trim().min(1).max(120),
  shortDescription: z.string().trim().min(1).max(500),
  image: z.string().trim().max(300).nullable().optional(),
  highlights: z.array(z.string().trim().min(1).max(200)).max(20),
  bestFor: z.string().trim().min(1).max(300),
  cardTagline: z.string().trim().max(200).nullable().optional(),
  iconKey: z.string().trim().min(1).max(40),
  videoUrl: z.string().trim().min(1).max(500),
  videoCtaTitle: z.string().trim().max(200).nullable().optional(),
  videoCtaDescription: z.string().trim().max(500).nullable().optional(),
  heroHeadline: z.string().trim().min(1).max(200),
  heroSubheadline: z.string().trim().min(1).max(500),
  heroCtaLabel: z.string().trim().max(80).nullable().optional(),
  aboutTitle: z.string().trim().min(1).max(200),
  aboutTag: z.string().trim().max(80).nullable().optional(),
  aboutDescription: z.array(z.string().trim().min(1).max(1000)).max(20),
  aboutContents: z.unknown().nullable().optional(),
  featuresSectionTitle: z.string().trim().max(200).nullable().optional(),
  features: z.array(featureSchema).min(1).max(40),
  capabilities: z.array(capabilitySchema).max(12),
  rolloutTag: z.string().trim().max(80).nullable().optional(),
  rolloutTitleTemplate: z.string().trim().max(200).nullable().optional(),
  rolloutDescription: z.string().trim().max(500).nullable().optional(),
  rolloutSteps: z.array(rolloutStepSchema).max(12),
  problems: z.unknown(),
  testimonialsSectionTag: z.string().trim().max(80).nullable().optional(),
  testimonialsSectionTitle: z.string().trim().max(200).nullable().optional(),
  testimonialsSectionDescription: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional(),
  useCases: z.unknown(),
  testimonials: z.unknown(),
  faqs: z.unknown(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  published: z.boolean().optional(),
  showInHeroOrbit: z.boolean().optional(),
  orbitRadius: z.number().nullable().optional(),
  orbitTilt: z.number().nullable().optional(),
  orbitPhase: z.number().nullable().optional(),
  orbitSpeed: z.number().nullable().optional(),
  // ── CMS page-copy overrides (Phase 2) — all optional, null/"" = code default. ──
  heroEyebrow: overrideText(80),
  capabilitiesTag: overrideText(80),
  capabilitiesDescription: overrideText(500),
  featuresTag: overrideText(80),
  featuresSectionDescription: overrideText(500),
  videoCtaButtonLabel: overrideText(80),
  faqSectionTag: overrideText(80),
  faqSectionTitleTemplate: overrideText(200),
  aboutSectionHeadings: z
    .array(z.string().trim().min(1).max(120))
    .max(12)
    .nullable()
    .optional(),
  allAppsTag: overrideText(80),
  allAppsTitle: overrideText(200),
  ctaHeadline: overrideText(200),
  ctaPrimaryLabel: overrideText(80),
  ctaPrimaryHref: overrideHref,
  ctaSecondaryLabel: overrideText(80),
  ctaSecondaryHref: overrideHref,
  defaultImage: overrideText(300),
  metaTitle: overrideText(200),
  metaDescription: overrideText(500),
});

export const createModuleSchema = moduleBaseSchema.strict();
export const updateModuleSchema = moduleBaseSchema.partial().strict();

export const reorderModulesSchema = z
  .object({
    orderedIds: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
