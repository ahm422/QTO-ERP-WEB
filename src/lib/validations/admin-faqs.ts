import { z } from "zod";

export const createFaqSchema = z.object({
  pageKey: z.string().trim().min(1).max(80),
  question: z.string().trim().min(1).max(500),
  answer: z.string().trim().min(1).max(5000),
  category: z.string().trim().max(80).nullable().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateFaqSchema = createFaqSchema
  .omit({ pageKey: true })
  .partial()
  .extend({
    pageKey: z.string().trim().min(1).max(80).optional(),
  });

export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
