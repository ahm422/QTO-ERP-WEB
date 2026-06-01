import { z } from "zod";

const businessTypeValues = [
  "startup",
  "smb",
  "enterprise",
  "non-profit",
  "government",
  "other",
] as const;

export const demoSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email").max(254),
  phone: z.string().trim().min(1, "Phone is required").max(40),
  country: z.string().trim().min(1, "Country is required").max(100),
  company: z.string().trim().min(1, "Company is required").max(200),
  businessType: z.enum(businessTypeValues, {
    message: "Invalid business type",
  }),
});

export type DemoInput = z.infer<typeof demoSchema>;
