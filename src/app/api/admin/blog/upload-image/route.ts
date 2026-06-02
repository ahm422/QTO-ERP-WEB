import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { getBlogPostByIdAdmin } from "@/lib/content-db";
import { presignGetObject, presignPutObject } from "@/lib/garage";
import { requireAdminApi } from "@/lib/require-admin-api";
import { requireGarage } from "@/lib/require-garage";
import {
  blogImageUploadSchema,
  buildBlogImageKey,
} from "@/lib/validations/admin-blog";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  const garageResult = requireGarage();
  if ("error" in garageResult) return garageResult.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = blogImageUploadSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { postId, contentType, fileName } = parsed.data;

  const post = await getBlogPostByIdAdmin(postId);
  if (!post) {
    return jsonError("Blog post not found", 404);
  }

  const objectKey = buildBlogImageKey(postId, fileName, contentType);

  try {
    const presignedPut = await presignPutObject(objectKey, contentType);
    const presignedGet = await presignGetObject(objectKey);
    if (!presignedPut || !presignedGet) {
      return jsonError("Failed to generate upload URL", 500);
    }

    return NextResponse.json({
      ok: true,
      objectKey,
      uploadUrl: presignedPut.uploadUrl,
      imageUrl: presignedGet.playbackUrl,
      putExpiresIn: presignedPut.expiresIn,
      getExpiresIn: presignedGet.expiresIn,
    });
  } catch (err) {
    console.error("[api/admin/blog/upload-image] Error:", err);
    return jsonError("Failed to generate upload URL", 500);
  }
}
