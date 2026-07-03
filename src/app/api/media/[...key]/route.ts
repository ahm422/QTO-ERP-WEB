import { jsonError } from "@/lib/api-errors";
import { getObject, isAllowedMediaKey } from "@/lib/media";
import { requireMediaBucket } from "@/lib/require-media-bucket";

type RouteContext = { params: Promise<{ key: string[] }> };

export async function GET(_request: Request, context: RouteContext) {
  const mediaResult = requireMediaBucket();
  if ("error" in mediaResult) return mediaResult.error;

  const { key: segments } = await context.params;
  const objectKey = segments.join("/");

  if (!isAllowedMediaKey(objectKey)) {
    return jsonError("Not found", 404);
  }

  const object = await getObject(objectKey);
  if (!object) {
    return jsonError("Not found", 404);
  }

  return new Response(object.body, {
    headers: {
      "Content-Type":
        object.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
