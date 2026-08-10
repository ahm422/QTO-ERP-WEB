import { z } from "zod";

const ctaLinkSchema = z.object({
  label: z.string().trim().min(1).max(80),
  url: z.string().trim().min(1).max(500),
});

export const upsertHomeFinalCtaSchema = z
  .object({
    tag: z.string().trim().min(1).max(80),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(1000),
    primaryCta: ctaLinkSchema,
    secondaryCta: ctaLinkSchema,
  })
  .strict();

export type UpsertHomeFinalCtaInput = z.infer<typeof upsertHomeFinalCtaSchema>;
