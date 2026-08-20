import { z } from "zod";
import { ALLOWED_DEMO_ICON_KEYS } from "@/lib/icon-map";

const demoIconKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .refine((key) => (ALLOWED_DEMO_ICON_KEYS as readonly string[]).includes(key), {
    message: "Invalid demo icon key",
  });

const demoIconStepSchema = z.object({
  iconKey: demoIconKeySchema,
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
});

const formFieldOptionsSchema = z.object({
  labels: z.object({
    name: z.string().trim().min(1).max(80),
    email: z.string().trim().min(1).max(80),
    phone: z.string().trim().min(1).max(80),
    companyPhone: z.string().trim().min(1).max(80),
    country: z.string().trim().min(1).max(80),
    company: z.string().trim().min(1).max(80),
    businessType: z.string().trim().min(1).max(80),
  }),
  placeholders: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(1).max(120),
    companyPhone: z.string().trim().min(1).max(120),
    company: z.string().trim().min(1).max(120),
    country: z.string().trim().min(1).max(120),
    businessType: z.string().trim().min(1).max(120),
  }),
  countries: z.array(z.string().trim().min(1).max(100)).min(1).max(100),
  businessTypes: z
    .array(
      z.object({
        value: z.string().trim().min(1).max(80),
        label: z.string().trim().min(1).max(120),
      }),
    )
    .min(1)
    .max(40),
  successMessage: z.string().trim().min(1).max(300).optional(),
  submitLabel: z.string().trim().min(1).max(80).optional(),
});

export const upsertDemoPageContentSchema = z
  .object({
    heroBadge: z.string().trim().min(1).max(80),
    heroTitle: z.string().trim().min(1).max(120),
    heroAccent: z.string().trim().min(1).max(120),
    heroDescription: z.string().trim().min(1).max(800),
    heroBadges: z.array(z.string().trim().min(1).max(120)).max(10),
    processTag: z.string().trim().min(1).max(80),
    processTitle: z.string().trim().min(1).max(120),
    processDescription: z.string().trim().min(1).max(500),
    whatToExpect: z.array(demoIconStepSchema).min(1).max(12),
    sideTitle: z.string().trim().min(1).max(120),
    sideDescription: z.string().trim().min(1).max(500),
    benefits: z.array(demoIconStepSchema).min(1).max(12),
    testimonialQuote: z.string().trim().min(1).max(500),
    testimonialAuthor: z.string().trim().min(1).max(120),
    testimonialRole: z.string().trim().min(1).max(200),
    formFieldOptions: formFieldOptionsSchema,
  })
  .strict();

export type UpsertDemoPageContentInput = z.infer<
  typeof upsertDemoPageContentSchema
>;
