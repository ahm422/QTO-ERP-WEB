import { z } from "zod";
import { ALLOWED_ABOUT_ICON_KEYS } from "@/lib/icon-map";
import { upsertHomeFinalCtaSchema } from "@/lib/validations/admin-home-cta";

const aboutIconKeySchema = z
  .string()
  .trim()
  .refine(
    (key): key is (typeof ALLOWED_ABOUT_ICON_KEYS)[number] =>
      (ALLOWED_ABOUT_ICON_KEYS as readonly string[]).includes(key),
    "Invalid about icon key",
  );

export const upsertAboutStorySchema = z
  .object({
    imageKey: z.string().trim().min(1).max(500).nullable().optional(),
    imageAlt: z.string().trim().min(1).max(200),
    badge: z.string().trim().min(1).max(80),
    title: z.string().trim().min(1).max(200),
    paragraph1: z.string().trim().min(1).max(20000),
    paragraph2: z.string().trim().min(1).max(20000),
    calloutIconKey: aboutIconKeySchema,
    calloutTitle: z.string().trim().min(1).max(200),
    calloutBody: z.string().trim().min(1).max(2000),
    calloutLinkLabel: z.string().trim().min(1).max(80),
    calloutLinkUrl: z.string().trim().min(1).max(500),
  })
  .strict();

export const createAboutValueSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(1000),
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateAboutValueSchema = createAboutValueSchema.partial();

export const reorderAboutValuesSchema = z
  .object({
    ids: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

/** Same shape as home final CTA. */
export const upsertAboutFinalCtaSchema = upsertHomeFinalCtaSchema;

export type UpsertAboutStoryInput = z.infer<typeof upsertAboutStorySchema>;
export type CreateAboutValueInput = z.infer<typeof createAboutValueSchema>;
export type UpdateAboutValueInput = z.infer<typeof updateAboutValueSchema>;
export type ReorderAboutValuesInput = z.infer<typeof reorderAboutValuesSchema>;
export type UpsertAboutFinalCtaInput = z.infer<typeof upsertAboutFinalCtaSchema>;
