import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  // Use the generated client from node_modules (avoids a bundled client missing new models).
  serverExternalPackages: ["@prisma/client", "prisma"],
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
  // limit static generation to 1 retry and 1 concurrent worker, to avoid overloading the database with too many requests at once during development. In production, these limits can be increased or removed as needed.
  experimental: {
  staticGenerationRetryCount: 1,
  staticGenerationMaxConcurrency: 1,
  staticGenerationMinPagesPerWorker: 100,
}
};

export default nextConfig;
