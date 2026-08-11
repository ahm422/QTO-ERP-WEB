import { createId } from "@paralleldrive/cuid2";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { mediaUrl } from "@/lib/media";
import { requireAdminApi } from "@/lib/require-admin-api";
import { requireMediaBucket } from "@/lib/require-media-bucket";

const ALLOWED_TYPES = new Set([
  "image/avif",
  "image/png",
  "image/webp",
  "image/jpeg",
]);
const MAX_BYTES = 5 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "image/avif": "avif",
  "image/png": "png",
  "image/webp": "webp",
  "image/jpeg": "jpg",
};

export async function POST(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const mediaResult = await requireMediaBucket();
  if ("error" in mediaResult) return mediaResult.error;
  const { bucket } = mediaResult;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Expected multipart form data", 400);
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return jsonError("Missing file field", 400);
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return jsonError("Only AVIF, PNG, WebP, and JPEG images are allowed", 400);
  }

  if (file.size > MAX_BYTES) {
    return jsonError("Image must be under 5MB", 400);
  }

  const ext = EXT_BY_TYPE[file.type] ?? "bin";
  const objectKey = `module-images/${createId()}.${ext}`;

  try {
    // arrayBuffer (not stream): workerd R2 requires a body with known length
    await bucket.put(objectKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    return NextResponse.json({
      ok: true,
      objectKey,
      imageUrl: mediaUrl(objectKey),
    });
  } catch (err) {
    console.error("[api/admin/modules/upload] Error:", err);
    return jsonError("Failed to upload image", 500);
  }
}
