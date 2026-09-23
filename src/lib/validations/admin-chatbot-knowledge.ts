import { z } from "zod";

export const createChatbotKnowledgeSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(20_000),
  category: z.string().trim().max(80).nullable().optional(),
  enabled: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateChatbotKnowledgeSchema =
  createChatbotKnowledgeSchema.partial();

export type CreateChatbotKnowledgeInput = z.infer<
  typeof createChatbotKnowledgeSchema
>;
export type UpdateChatbotKnowledgeInput = z.infer<
  typeof updateChatbotKnowledgeSchema
>;
