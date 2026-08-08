import { z } from "zod";
import { ALLOWED_STAT_ICON_KEYS } from "@/lib/icon-map";

const statIconKeySchema = z
  .string()
  .trim()
  .refine(
    (key): key is (typeof ALLOWED_STAT_ICON_KEYS)[number] =>
      (ALLOWED_STAT_ICON_KEYS as readonly string[]).includes(key),
    "Invalid stat icon key",
  );

export const createHomeStatSchema = z.object({
  label: z.string().trim().min(1).max(100),
  value: z.number().finite(),
  suffix: z.string().trim().min(1).max(20),
  iconKey: statIconKeySchema,
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateHomeStatSchema = createHomeStatSchema.partial();

export type CreateHomeStatInput = z.infer<typeof createHomeStatSchema>;
export type UpdateHomeStatInput = z.infer<typeof updateHomeStatSchema>;
