import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { getBlogPostByIdAdmin } from "@/lib/content-db";
import { mediaUrl } from "@/lib/media";
import { requireAdminApi } from "@/lib/require-admin-api";
import { requireMediaBucket } from "@/lib/require-media-bucket";
import {
  blogImageUploadSchema,
  buildBlogImageKey,
} from "@/lib/validations/admin-blog";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  const mediaResult = requireMediaBucket();
  if ("error" in mediaResult) return mediaResult.error;
  const { bucket } = mediaResult;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Expected multipart form data", 400);
  }

  const file = formData.get("file");
  const postId = formData.get("postId");

  if (!file || !(file instanceof File)) {
    return jsonError("Missing file field", 400);
  }

  if (typeof postId !== "string" || !postId.trim()) {
    return jsonError("Missing postId field", 400);
  }

  const parsed = blogImageUploadSchema.safeParse({
    postId: postId.trim(),
    contentType: file.type,
    fileName: file.name,
  });
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return jsonError("Only JPEG, PNG, and WebP images are allowed", 400);
  }

  if (file.size > MAX_BYTES) {
    return jsonError("Image must be under 10MB", 400);
  }

  const { postId: validPostId, contentType, fileName } = parsed.data;

  const post = await getBlogPostByIdAdmin(validPostId);
  if (!post) {
    return jsonError("Blog post not found", 404);
  }

  const objectKey = buildBlogImageKey(validPostId, fileName, contentType);

  try {
    await bucket.put(objectKey, file.stream(), {
      httpMetadata: { contentType },
    });

    return NextResponse.json({
      ok: true,
      objectKey,
      imageUrl: mediaUrl(objectKey),
    });
  } catch (err) {
    console.error("[api/admin/blog/upload-image] Error:", err);
    return jsonError("Failed to upload image", 500);
  }
}
