import { z } from "zod";

export const chatSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(2000, "Messages can be at most 2000 characters"),
});

export type ChatInput = z.infer<typeof chatSchema>;
