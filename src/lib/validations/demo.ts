import { z } from "zod";

export const demoSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email").max(254),
  phone: z.string().trim().min(1, "Phone is required").max(40),
  companyPhone: z
    .string()
    .trim()
    .min(1, "Company phone is required")
    .max(40),
  country: z.string().trim().min(1, "Country is required").max(100),
  company: z.string().trim().min(1, "Company is required").max(200),
  // CMS-editable business types — free string (seed still uses startup|smb|…)
  businessType: z
    .string()
    .trim()
    .min(1, "Business type is required")
    .max(100),
});

export type DemoInput = z.infer<typeof demoSchema>;
