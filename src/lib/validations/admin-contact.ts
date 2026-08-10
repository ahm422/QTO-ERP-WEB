import { z } from "zod";
import { ALLOWED_CONTACT_ICON_KEYS } from "@/lib/icon-map";

const contactIconKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .refine(
    (key) => (ALLOWED_CONTACT_ICON_KEYS as readonly string[]).includes(key),
    { message: "Invalid contact icon key" },
  );

const supportCardSchema = z.object({
  iconKey: contactIconKeySchema,
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
});

export const upsertContactSupportContentSchema = z
  .object({
    tag: z.string().trim().min(1).max(80),
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(500),
    cards: z.array(supportCardSchema).min(1).max(12),
    responseTimes: z.object({
      typical: z.string().trim().min(1).max(120),
      priority: z.string().trim().min(1).max(120),
    }),
  })
  .strict();

const contactFormFieldOptionsSchema = z.object({
  labels: z.object({
    name: z.string().trim().min(1).max(80),
    email: z.string().trim().min(1).max(80),
    phone: z.string().trim().min(1).max(80),
    company: z.string().trim().min(1).max(80),
    companySize: z.string().trim().min(1).max(80),
    subject: z.string().trim().min(1).max(80),
    message: z.string().trim().min(1).max(80),
  }),
  placeholders: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(1).max(120),
    company: z.string().trim().min(1).max(120),
    companySize: z.string().trim().min(1).max(120),
    subject: z.string().trim().min(1).max(120),
    message: z.string().trim().min(1).max(300),
  }),
  companySizes: z
    .array(
      z.object({
        value: z.string().trim().min(1).max(80),
        label: z.string().trim().min(1).max(120),
      }),
    )
    .min(1)
    .max(20),
  subjects: z
    .array(
      z.object({
        value: z.string().trim().min(1).max(80),
        label: z.string().trim().min(1).max(120),
      }),
    )
    .min(1)
    .max(20),
  successMessage: z.string().trim().min(1).max(300).optional(),
  submitLabel: z.string().trim().min(1).max(80).optional(),
});

export const upsertContactPageContentSchema = z
  .object({
    sideTitle: z.string().trim().min(1).max(120),
    sideDescription: z.string().trim().min(1).max(500),
    formFieldOptions: contactFormFieldOptionsSchema,
    faqTag: z.string().trim().min(1).max(80),
    faqTitle: z.string().trim().min(1).max(120),
    faqDescription: z.string().trim().min(1).max(500),
  })
  .strict();

export const createContactChannelSchema = z
  .object({
    type: z.string().trim().min(1).max(40),
    label: z.string().trim().min(1).max(120),
    value: z.string().trim().min(1).max(300),
    iconKey: contactIconKeySchema,
    sortOrder: z.number().int().min(0).max(9999).optional(),
    published: z.boolean().optional(),
  })
  .strict();

export const updateContactChannelSchema = createContactChannelSchema
  .partial()
  .strict();

export const reorderContactChannelsSchema = z
  .object({
    orderedIds: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

const leadStatuses = ["NEW", "READ", "ARCHIVED"] as const;

export const updateContactInquiryStatusSchema = z.object({
  status: z.enum(leadStatuses),
});

export const contactInquiryReplySchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200),
  body: z.string().trim().min(1, "Message is required").max(10000),
});

export type UpsertContactSupportContentInput = z.infer<
  typeof upsertContactSupportContentSchema
>;
export type UpsertContactPageContentInput = z.infer<
  typeof upsertContactPageContentSchema
>;
export type CreateContactChannelInput = z.infer<
  typeof createContactChannelSchema
>;
export type UpdateContactChannelInput = z.infer<
  typeof updateContactChannelSchema
>;
export type UpdateContactInquiryStatusInput = z.infer<
  typeof updateContactInquiryStatusSchema
>;
export type ContactInquiryReplyInput = z.infer<
  typeof contactInquiryReplySchema
>;
