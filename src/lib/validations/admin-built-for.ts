import { z } from "zod";
import { ALLOWED_BUILT_FOR_ICON_KEYS } from "@/lib/icon-map";

const builtForIconKeySchema = z
  .string()
  .trim()
  .refine(
    (key): key is (typeof ALLOWED_BUILT_FOR_ICON_KEYS)[number] =>
      (ALLOWED_BUILT_FOR_ICON_KEYS as readonly string[]).includes(key),
    "Invalid built-for icon key",
  );

export const createBuiltForCardSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(500),
  iconKey: builtForIconKeySchema,
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateBuiltForCardSchema = createBuiltForCardSchema.partial();

export const updateHomeSectionSchema = z
  .object({
    tag: z.string().trim().min(1).max(80),
    title: z.string().trim().min(1).max(160),
    accent: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(500),
  })
  .strict()
  .partial();

export type CreateBuiltForCardInput = z.infer<typeof createBuiltForCardSchema>;
export type UpdateBuiltForCardInput = z.infer<typeof updateBuiltForCardSchema>;
export type UpdateHomeSectionInput = z.infer<typeof updateHomeSectionSchema>;
