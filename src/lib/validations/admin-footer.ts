import { z } from "zod";

const footerLinkSchema = z.object({
  label: z.string().trim().min(1).max(80),
  url: z.string().trim().min(1).max(500),
  external: z.boolean().optional(),
});

const footerLinkGroupSchema = z.object({
  title: z.string().trim().min(1).max(80),
  links: z.array(footerLinkSchema).min(1).max(20),
});

export const upsertFooterContentSchema = z
  .object({
    brandBlurb: z.string().trim().min(1).max(500),
    builtByLabel: z.string().trim().min(1).max(80),
    builtByUrl: z.string().trim().min(1).max(500),
    newsletterHeading: z.string().trim().min(1).max(80),
    newsletterCopy: z.string().trim().min(1).max(500),
    linkGroups: z.array(footerLinkGroupSchema).min(1).max(8),
    copyrightText: z.string().trim().min(1).max(200),
    bottomLinks: z.array(footerLinkSchema).max(10),
  })
  .strict();

export type UpsertFooterContentInput = z.infer<typeof upsertFooterContentSchema>;
