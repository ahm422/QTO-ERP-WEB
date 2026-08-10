import { z } from "zod";

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
