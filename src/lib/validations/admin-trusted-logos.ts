import { z } from "zod";

const trustedLogoImageKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (key) => key.startsWith("trusted-logos/") && !key.includes(".."),
    "logoImageKey must be under trusted-logos/",
  );

export const createTrustedLogoSchema = z.object({
  name: z.string().trim().min(1).max(120),
  logoImageKey: trustedLogoImageKeySchema.nullable().optional(),
  linkUrl: z.string().trim().max(500).nullable().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateTrustedLogoSchema = createTrustedLogoSchema.partial();

export type CreateTrustedLogoInput = z.infer<typeof createTrustedLogoSchema>;
export type UpdateTrustedLogoInput = z.infer<typeof updateTrustedLogoSchema>;
