import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { IMAGE_KEY_PREFIXES, isAllowedMediaKey, mediaUrl } from "@/lib/media";
import { requireRole } from "@/lib/permissions";
import { requireMediaBucket } from "@/lib/require-media-bucket";

type MediaListItem = {
  objectKey: string;
  imageUrl: string;
  size: number;
  uploaded: string;
};

async function listPrefix(
  bucket: R2Bucket,
  prefix: string,
): Promise<MediaListItem[]> {
  const items: MediaListItem[] = [];
  let cursor: string | undefined;

  do {
    const page = await bucket.list({ prefix, cursor, limit: 1000 });
    for (const object of page.objects) {
      if (!object.key || object.key.endsWith("/")) continue;
      if (!isAllowedMediaKey(object.key)) continue;
      items.push({
        objectKey: object.key,
        imageUrl: mediaUrl(object.key),
        size: object.size,
        uploaded: object.uploaded.toISOString(),
      });
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  return items;
}

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  const mediaResult = await requireMediaBucket();
  if ("error" in mediaResult) return mediaResult.error;
  const { bucket } = mediaResult;

  try {
    const groups = await Promise.all(
      IMAGE_KEY_PREFIXES.map((prefix) => listPrefix(bucket, prefix)),
    );
    const items = groups
      .flat()
      .sort((a, b) => (a.uploaded < b.uploaded ? 1 : -1));

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("[api/admin/media GET] Error:", err);
    return jsonError("Failed to list images", 500);
  }
}
