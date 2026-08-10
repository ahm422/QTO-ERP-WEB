import { z } from "zod";

export const upsertPricingPageContentSchema = z
  .object({
    heroBadge: z.string().trim().min(1).max(80),
    heroTitle: z.string().trim().min(1).max(120),
    heroSubtitle: z.string().trim().min(1).max(500),
    faqTag: z.string().trim().min(1).max(80),
    faqTitle: z.string().trim().min(1).max(120),
  })
  .strict();

export type UpsertPricingPageContentInput = z.infer<
  typeof upsertPricingPageContentSchema
>;
