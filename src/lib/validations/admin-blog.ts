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

const coverImageUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (value.startsWith("/api/media/")) {
      return !value.includes("..");
    }
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Cover image must be an http(s) URL or /api/media/ path")
  .nullable()
  .optional();

const tagsSchema = z
  .array(z.string().trim().min(1).max(40))
  .max(12)
  .default([]);

const blogPostFields = {
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
  coverImageUrl: coverImageUrlSchema,
  tags: tagsSchema,
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().trim().max(70).nullable().optional(),
  metaDescription: z.string().trim().max(160).nullable().optional(),
};

export const createBlogPostSchema = z.object(blogPostFields);

export const updateBlogPostSchema = z.object({
  slug: blogPostFields.slug.optional(),
  title: blogPostFields.title.optional(),
  category: blogPostFields.category.optional(),
  excerpt: blogPostFields.excerpt,
  content: blogPostFields.content.optional(),
  status: blogPostFields.status,
  publishedAt: publishedAtSchema,
  coverImageUrl: coverImageUrlSchema,
  tags: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
  isFeatured: z.boolean().optional(),
  metaTitle: z.string().trim().max(70).nullable().optional(),
  metaDescription: z.string().trim().max(160).nullable().optional(),
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
  kind: z.enum(["inline", "cover"]).optional(),
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

function blogMediaExtension(
  fileName: string,
  contentType: z.infer<typeof blogImageUploadSchema>["contentType"],
): string {
  return sanitizeExtension(fileName) ?? EXT_BY_CONTENT_TYPE[contentType];
}

export function buildBlogImageKey(
  postId: string,
  fileName: string,
  contentType: z.infer<typeof blogImageUploadSchema>["contentType"],
): string {
  const ext = blogMediaExtension(fileName, contentType);
  return `blog-images/${postId}/${randomUUID()}.${ext}`;
}

export function buildBlogCoverKey(
  postId: string,
  fileName: string,
  contentType: z.infer<typeof blogImageUploadSchema>["contentType"],
): string {
  const ext = blogMediaExtension(fileName, contentType);
  return `blog-covers/${postId}/${randomUUID()}.${ext}`;
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

const HTML_TAG_RE = /<[^>]+>/g;
const HTML_ENTITY_RE = /&(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);/g;

export function computeReadTime(html: string): number {
  const text = html
    .replace(HTML_TAG_RE, " ")
    .replace(HTML_ENTITY_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return 1;
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type BlogImageUploadInput = z.infer<typeof blogImageUploadSchema>;
