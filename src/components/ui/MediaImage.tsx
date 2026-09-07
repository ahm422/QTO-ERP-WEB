import Image, { type ImageProps } from "next/image";
import { isDynamicMediaUrl } from "@/lib/media";

/**
 * Drop-in replacement for `next/image` for sources that may be CMS uploads
 * served from the dynamic `/api/media/*` route.
 *
 * On Cloudflare, OpenNext's `/_next/image` optimizer fetches root-relative
 * sources from the static ASSETS binding, which has no knowledge of the
 * dynamic media route and returns 404 (surfacing as broken images in
 * production). For those sources we render with `unoptimized` so the browser
 * requests `/api/media/*` directly. Static (`/assets/*`) and remote images
 * keep the optimizer.
 */
export function MediaImage({ src, alt, unoptimized, ...props }: ImageProps) {
  const bypassOptimizer =
    typeof src === "string" && isDynamicMediaUrl(src) ? true : unoptimized;

  return (
    <Image src={src} alt={alt} {...props} unoptimized={bypassOptimizer} />
  );
}
