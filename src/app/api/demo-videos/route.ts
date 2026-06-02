import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import {
  listPublishedDemoVideos,
  serializeDemoVideoPublic,
} from "@/lib/demo-videos-db";
import { presignGetObject } from "@/lib/garage";
import { requireGarage } from "@/lib/require-garage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const garageResult = requireGarage();
  if ("error" in garageResult) return garageResult.error;

  const { searchParams } = new URL(request.url);
  const moduleSlug = searchParams.get("moduleSlug")?.trim() || undefined;

  try {
    const rows = await listPublishedDemoVideos(
      moduleSlug ? { moduleSlug } : undefined,
    );

    const videos = await Promise.all(
      rows.map(async (row) => {
        const presigned = await presignGetObject(row.objectKey);
        if (!presigned) {
          throw new Error("Failed to presign GET");
        }
        return {
          ...serializeDemoVideoPublic(row),
          playbackUrl: presigned.playbackUrl,
        };
      }),
    );

    return NextResponse.json({ videos });
  } catch (err) {
    console.error("[api/demo-videos] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
