import { z } from "zod";

export const updatePricingPlanSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).max(500).optional(),
  monthlyPriceDisplay: z.number().int().min(0).max(999999).optional(),
  yearlyPriceDisplay: z.number().int().min(0).max(999999).optional(),
  popular: z.boolean().optional(),
  features: z.array(z.string().trim().min(1).max(200)).min(1).max(50).optional(),
  cta: z.string().trim().min(1).max(120).optional(),
  stripePriceIdMonthly: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .nullable()
    .optional(),
  stripePriceIdYearly: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .nullable()
    .optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  published: z.boolean().optional(),
});

export type UpdatePricingPlanInput = z.infer<typeof updatePricingPlanSchema>;
