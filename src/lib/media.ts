import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getMediaBucket(): R2Bucket {
  const { env } = getCloudflareContext();
  return env.MEDIA_BUCKET;
}

export function mediaUrl(objectKey: string): string {
  return `/api/media/${objectKey}`;
}

export async function putObject(
  key: string,
  data: ArrayBuffer | Uint8Array | ReadableStream,
  contentType: string,
): Promise<void> {
  await getMediaBucket().put(key, data, {
    httpMetadata: { contentType },
  });
}

export async function getObject(key: string): Promise<R2ObjectBody | null> {
  return getMediaBucket().get(key);
}

const ALLOWED_KEY_PREFIXES = ["demo-videos/", "blog-images/"] as const;

export function isAllowedMediaKey(key: string): boolean {
  if (!key || key.includes("..")) return false;
  return ALLOWED_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}
