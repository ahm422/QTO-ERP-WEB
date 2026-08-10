import { z } from "zod";
import { ALLOWED_DOMAIN_ICON_KEYS } from "@/lib/icon-map";

const domainIconKeySchema = z
  .string()
  .trim()
  .refine(
    (key): key is (typeof ALLOWED_DOMAIN_ICON_KEYS)[number] =>
      (ALLOWED_DOMAIN_ICON_KEYS as readonly string[]).includes(key),
    "Invalid domain icon key",
  );

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase alphanumeric with hyphens",
  );

export const createIndustryDomainSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(100),
  orderIndex: z.string().trim().min(1).max(10).optional(),
  systemsCount: z.number().int().min(0).max(999),
  iconKey: domainIconKeySchema,
  description: z.string().trim().min(1).max(1000),
  leaders: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  ctaLabel: z.string().trim().min(1).max(120).nullable().optional(),
  ctaUrl: z.string().trim().min(1).max(500).nullable().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateIndustryDomainSchema = createIndustryDomainSchema
  .partial()
  .extend({
    leaders: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
  });

export type CreateIndustryDomainInput = z.infer<
  typeof createIndustryDomainSchema
>;
export type UpdateIndustryDomainInput = z.infer<
  typeof updateIndustryDomainSchema
>;
