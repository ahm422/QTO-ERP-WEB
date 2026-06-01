import { z } from "zod";

const domainRegionValues = [
  "us-east-1",
  "eu-west-1",
  "sa-east-1",
  "ap-northeast-1",
] as const;

const domainNameSchema = z
  .string()
  .trim()
  .min(3, "Domain name is required")
  .max(253)
  .regex(
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i,
    "Invalid domain name",
  );

export const createDomainSchema = z.object({
  name: domainNameSchema,
  region: z.enum(domainRegionValues).optional(),
  openTracking: z.boolean().optional(),
  clickTracking: z.boolean().optional(),
});

export const updateDomainSchema = z.object({
  openTracking: z.boolean().optional(),
  clickTracking: z.boolean().optional(),
  tls: z.enum(["enforced", "opportunistic"]).optional(),
  trackingSubdomain: z.string().trim().min(1).max(63).optional(),
});

export type CreateDomainInput = z.infer<typeof createDomainSchema>;
export type UpdateDomainInput = z.infer<typeof updateDomainSchema>;
