import { randomUUID } from "node:crypto";
import { z } from "zod";

const kebabSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const blogStatuses = ["DRAFT", "PUBLISHED"] as const;
const blogImageContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const publishedAtSchema = z
  .string()
  .datetime({ offset: true })
  .nullable()
  .optional();

export const createBlogPostSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(kebabSlugRegex, "Slug must be kebab-case"),
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  excerpt: z.string().trim().max(500).nullable().optional(),
  content: z.string().min(1).max(500000),
  status: z.enum(blogStatuses).optional(),
  publishedAt: publishedAtSchema,
});

export const updateBlogPostSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(kebabSlugRegex, "Slug must be kebab-case")
    .optional(),
  title: z.string().trim().min(1).max(200).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  excerpt: z.string().trim().max(500).nullable().optional(),
  content: z.string().min(1).max(500000).optional(),
  status: z.enum(blogStatuses).optional(),
  publishedAt: publishedAtSchema,
});

export const blogImageUploadSchema = z.object({
  postId: z.string().trim().min(1),
  contentType: z.enum(blogImageContentTypes, {
    message: "Invalid content type",
  }),
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(/^[^/\\]+$/, "Invalid file name"),
});

const EXT_BY_CONTENT_TYPE: Record<
  (typeof blogImageContentTypes)[number],
  string
> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function sanitizeExtension(fileName: string): string | null {
  const base = fileName.split(/[/\\]/).pop() ?? fileName;
  const match = /\.([a-z0-9]+)$/i.exec(base);
  if (!match) return null;
  const ext = match[1].toLowerCase();
  if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp") {
    return ext === "jpeg" ? "jpg" : ext;
  }
  return null;
}

export function buildBlogImageKey(
  postId: string,
  fileName: string,
  contentType: z.infer<typeof blogImageUploadSchema>["contentType"],
): string {
  const fromFile = sanitizeExtension(fileName);
  const ext = fromFile ?? EXT_BY_CONTENT_TYPE[contentType];
  const id = randomUUID();
  return `blog-images/${postId}/${id}.${ext}`;
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type BlogImageUploadInput = z.infer<typeof blogImageUploadSchema>;
