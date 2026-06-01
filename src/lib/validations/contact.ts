import { z } from "zod";

const subjectValues = [
  "general",
  "sales",
  "support",
  "partnership",
  "feedback",
  "other",
] as const;

const companySizeValues = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email").max(254),
  phone: z.string().trim().min(1, "Phone is required").max(40),
  company: z.string().trim().min(1, "Company is required").max(200),
  subject: z.enum(subjectValues, { message: "Invalid subject" }),
  companySize: z.enum(companySizeValues, {
    message: "Invalid company size",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
