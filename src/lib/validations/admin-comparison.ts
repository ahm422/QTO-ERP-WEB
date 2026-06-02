import { z } from "zod";

export const createComparisonSchema = z.object({
  feature: z.string().trim().min(1, "Feature is required").max(200),
  starter: z.string().trim().min(1).max(200),
  growth: z.string().trim().min(1).max(200),
  enterprise: z.string().trim().min(1).max(200),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  published: z.boolean().optional(),
});

export const updateComparisonSchema = createComparisonSchema.partial();

export type CreateComparisonInput = z.infer<typeof createComparisonSchema>;
export type UpdateComparisonInput = z.infer<typeof updateComparisonSchema>;
