import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import {
  listPublishedDemoVideos,
  serializeDemoVideoPublic,
} from "@/lib/demo-videos-db";
import { mediaUrl } from "@/lib/media";
import { requireMediaBucket } from "@/lib/require-media-bucket";


export async function GET(request: Request) {
  const mediaResult = await requireMediaBucket();
  if ("error" in mediaResult) return mediaResult.error;

  const { searchParams } = new URL(request.url);
  const moduleSlug = searchParams.get("moduleSlug")?.trim() || undefined;

  try {
    const rows = await listPublishedDemoVideos(
      moduleSlug ? { moduleSlug } : undefined,
    );

    const videos = rows.map((row) => ({
      ...serializeDemoVideoPublic(row),
      playbackUrl: mediaUrl(row.objectKey),
    }));

    return NextResponse.json({ videos });
  } catch (err) {
    console.error("[api/demo-videos] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
