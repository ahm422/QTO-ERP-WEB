import { randomUUID } from "node:crypto";
import { z } from "zod";

const kebabSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const demoVideoContentTypes = ["video/mp4", "video/webm"] as const;

export const uploadDemoVideoSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120)
    .regex(kebabSlugRegex, "Slug must be kebab-case"),
  title: z.string().trim().min(1, "Title is required").max(200),
  contentType: z.enum(demoVideoContentTypes, {
    message: "Invalid content type",
  }),
  fileName: z
    .string()
    .trim()
    .min(1, "File name is required")
    .max(255)
    .regex(/^[^/\\]+$/, "Invalid file name"),
  moduleSlug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(kebabSlugRegex, "Invalid module slug")
    .optional(),
});

export const updateDemoVideoSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  moduleSlug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(kebabSlugRegex, "Invalid module slug")
    .nullable()
    .optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export type UploadDemoVideoInput = z.infer<typeof uploadDemoVideoSchema>;
export type UpdateDemoVideoInput = z.infer<typeof updateDemoVideoSchema>;

const EXT_BY_CONTENT_TYPE: Record<
  (typeof demoVideoContentTypes)[number],
  string
> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

function sanitizeExtension(fileName: string): string | null {
  const base = fileName.split(/[/\\]/).pop() ?? fileName;
  const match = /\.([a-z0-9]+)$/i.exec(base);
  if (!match) return null;
  const ext = match[1].toLowerCase();
  if (ext === "mp4" || ext === "webm") return ext;
  return null;
}

export function buildObjectKey(
  slug: string,
  fileName: string,
  contentType: UploadDemoVideoInput["contentType"],
): string {
  const fromFile = sanitizeExtension(fileName);
  const ext = fromFile ?? EXT_BY_CONTENT_TYPE[contentType];
  const id = randomUUID();
  return `demo-videos/${slug}/${id}.${ext}`;
}
