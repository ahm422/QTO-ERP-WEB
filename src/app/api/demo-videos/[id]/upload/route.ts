import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { getDemoVideoById } from "@/lib/demo-videos-db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { requireMediaBucket } from "@/lib/require-media-bucket";

const MAX_BYTES = 500 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["video/mp4", "video/webm"]);

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const mediaResult = await requireMediaBucket();
  if ("error" in mediaResult) return mediaResult.error;
  const { bucket } = mediaResult;

  const { id } = await context.params;

  const video = await getDemoVideoById(id);
  if (!video) {
    return jsonError("Video not found", 404);
  }

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
    return jsonError("File must be under 500MB", 400);
  }

  if (file.type !== video.contentType) {
    return jsonError(
      `Content type must match upload registration (${video.contentType})`,
      400,
    );
  }

  try {
    // arrayBuffer (not stream): workerd R2 requires a body with known length
    await bucket.put(video.objectKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: video.contentType },
    });

    return NextResponse.json({ ok: true, objectKey: video.objectKey });
  } catch (err) {
    console.error("[api/demo-videos/[id]/upload] Error:", err);
    return jsonError("Failed to upload to storage", 500);
  }
}
