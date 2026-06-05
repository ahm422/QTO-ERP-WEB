import { z } from "zod";

export const createNavResourceSchema = z.object({
  label:     z.string().trim().min(1).max(100),
  href:      z.string().trim().min(1).max(500),
  iconKey:   z.string().trim().min(1).max(50),
  subtitle:  z.string().trim().max(200).nullable().optional(),
  visible:   z.boolean().optional(),
  external:  z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateNavResourceSchema = createNavResourceSchema.partial();

export type CreateNavResourceInput = z.infer<typeof createNavResourceSchema>;
export type UpdateNavResourceInput = z.infer<typeof updateNavResourceSchema>;
