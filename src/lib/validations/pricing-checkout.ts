import { z } from "zod";

const planSlugValues = ["starter", "growth", "enterprise"] as const;
const intervalValues = ["monthly", "yearly"] as const;

export const pricingCheckoutSchema = z.object({
  planSlug: z.enum(planSlugValues, { message: "Invalid plan" }),
  interval: z.enum(intervalValues, { message: "Invalid billing interval" }),
  customerEmail: z
    .string()
    .trim()
    .email("Invalid email")
    .max(254)
    .optional(),
});

export type PricingCheckoutInput = z.infer<typeof pricingCheckoutSchema>;
