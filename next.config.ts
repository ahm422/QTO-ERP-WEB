import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Hydrate Cloudflare bindings for `next dev`. Safe to fire-and-forget; request
// paths use getCloudflareContext({ async: true }) as a fallback if this races.
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
