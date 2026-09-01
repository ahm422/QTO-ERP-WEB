import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function getMediaBucket(): Promise<R2Bucket> {
  const { env } = await getCloudflareContext({ async: true });
  return env.MEDIA_BUCKET;
}

export function mediaUrl(objectKey: string): string {
  return `/api/media/${objectKey}`;
}

export async function putObject(
  key: string,
  data: ArrayBuffer | Uint8Array | Blob,
  contentType: string,
): Promise<void> {
  const bucket = await getMediaBucket();
  // Prefer known-length bodies; raw ReadableStream fails in workerd R2
  const body =
    data instanceof Blob ? await data.arrayBuffer() : data;
  await bucket.put(key, body, {
    httpMetadata: { contentType },
  });
}

export async function getObject(key: string): Promise<R2ObjectBody | null> {
  const bucket = await getMediaBucket();
  return bucket.get(key);
}

const ALLOWED_KEY_PREFIXES = [
  "demo-videos/",
  "blog-images/",
  "blog-covers/",
  "trusted-logos/",
  "about-story/",
  "module-images/",
  "module-videos/",
  "solution-images/",
] as const;

export function isAllowedMediaKey(key: string): boolean {
  if (!key || key.includes("..")) return false;
  return ALLOWED_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}
