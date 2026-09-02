import { createId } from "@paralleldrive/cuid2";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { mediaUrl } from "@/lib/media";
import { requireRole } from "@/lib/permissions";
import { requireMediaBucket } from "@/lib/require-media-bucket";

const ALLOWED_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_BYTES = 500 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export async function POST(request: Request) {
  const admin = await requireRole(request, "content:create");
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
    return jsonError("Only video/mp4 and video/webm are allowed", 400);
  }

  if (file.size > MAX_BYTES) {
    return jsonError("Video must be under 500MB", 400);
  }

  const ext = EXT_BY_TYPE[file.type] ?? "bin";
  const objectKey = `module-videos/${createId()}.${ext}`;

  try {
    // arrayBuffer (not stream): workerd R2 requires a body with known length
    await bucket.put(objectKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    return NextResponse.json({
      ok: true,
      objectKey,
      videoUrl: mediaUrl(objectKey),
    });
  } catch (err) {
    console.error("[api/admin/modules/upload-video] Error:", err);
    return jsonError("Failed to upload video", 500);
  }
}
