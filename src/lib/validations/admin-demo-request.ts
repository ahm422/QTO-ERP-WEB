import { z } from "zod";

const leadStatuses = ["NEW", "READ", "ARCHIVED"] as const;

export const updateDemoRequestStatusSchema = z.object({
  status: z.enum(leadStatuses),
});

export const demoRequestReplySchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200),
  body: z.string().trim().min(1, "Message is required").max(10000),
});

export type UpdateDemoRequestStatusInput = z.infer<
  typeof updateDemoRequestStatusSchema
>;
export type DemoRequestReplyInput = z.infer<typeof demoRequestReplySchema>;
