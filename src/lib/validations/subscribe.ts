import { z } from "zod";

export const subscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email")
    .max(254)
    .transform((value) => value.toLowerCase()),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
