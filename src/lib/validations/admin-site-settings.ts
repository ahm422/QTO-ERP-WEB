import { z } from "zod";

export const updateSiteSettingsSchema = z
  .object({
    site_name: z.string().trim().min(1).max(100).optional(),
    logo_url: z.string().trim().max(500).optional(),
    cta_label: z.string().trim().min(1).max(80).optional(),
    cta_url: z.string().trim().min(1).max(300).optional(),
    cta_visible: z.enum(["true", "false"]).optional(),
  })
  .strict();

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
