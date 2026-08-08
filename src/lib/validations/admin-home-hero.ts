import { z } from "zod";

const ctaUrl = z.string().trim().min(1).max(500);

export const orbitOverrideSchema = z
  .object({
    moduleId: z.string().trim().min(1).max(64),
    orbitRadius: z.number().min(0.5).max(5).nullable().optional(),
    orbitTilt: z.number().min(-2).max(2).nullable().optional(),
    orbitPhase: z.number().min(0).max(Math.PI * 4).nullable().optional(),
    orbitSpeed: z.number().min(0.01).max(2).nullable().optional(),
    sortOrder: z.number().int().min(0).max(9999).optional(),
    showInHeroOrbit: z.boolean().optional(),
  })
  .strict();

export const updateHomeHeroSchema = z
  .object({
    eyebrowText: z.string().trim().min(1).max(120).optional(),
    titleLine1: z.string().trim().min(1).max(160).optional(),
    titleAccent: z.string().trim().min(1).max(160).optional(),
    subtitle: z.string().trim().min(1).max(500).optional(),
    bullets: z
      .array(z.string().trim().min(1).max(200))
      .min(1)
      .max(12)
      .optional(),
    primaryCtaLabel: z.string().trim().min(1).max(80).optional(),
    primaryCtaUrl: ctaUrl.optional(),
    secondaryCtaLabel: z.string().trim().min(1).max(80).optional(),
    secondaryCtaUrl: ctaUrl.optional(),
    poweredByText: z.string().trim().min(1).max(120).optional(),
    poweredByUrl: ctaUrl.optional(),
    orbitOverrides: z.array(orbitOverrideSchema).max(50).optional(),
  })
  .strict();

export type UpdateHomeHeroInput = z.infer<typeof updateHomeHeroSchema>;
export type OrbitOverrideInput = z.infer<typeof orbitOverrideSchema>;
