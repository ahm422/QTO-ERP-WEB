import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { getPlatformProxy } from "wrangler";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Bindings for `npm run dev` only (see wrangler.dev.jsonc).
 * Omits DOQueueHandler + WORKER_SELF_REFERENCE — those cannot run under
 * next+Miniflare and otherwise spam the Next overlay.
 *
 * Must finish before Next serves requests. OpenNext only inits one of the two
 * config processes; the sibling falls back to default wrangler.jsonc unless we
 * seed the global context here too. ESM + top-level await makes this reliable
 * (next.config.ts cannot use TLA under Next's require()-based loader).
 */
const cloudflareDevOptions = {
  configPath: path.join(rootDir, "wrangler.dev.jsonc"),
  persist: { path: path.join(rootDir, ".wrangler/state/v3") },
};

const CLOUDFLARE_CONTEXT_SYMBOL = Symbol.for("__cloudflare-context__");

// `npm run dev` only. During `next build` / `opennextjs-cloudflare build`
// NODE_ENV is "production" — skip this so the build never opens a (remote)
// connection to the D1 configured in wrangler.dev.jsonc.
const isDev = process.env.NODE_ENV === "development";

if (isDev) {
  await initOpenNextCloudflareForDev(cloudflareDevOptions);

  if (!globalThis[CLOUDFLARE_CONTEXT_SYMBOL]) {
    const proxy = await getPlatformProxy({
      ...cloudflareDevOptions,
      envFiles: [],
    });
    globalThis[CLOUDFLARE_CONTEXT_SYMBOL] = {
      env: proxy.env,
      cf: proxy.cf,
      ctx: proxy.ctx,
    };
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["localhost", "localhost"],
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
  async redirects() {
    return [
      { source: "/pricing", destination: "/contact", permanent: true },
      { source: "/pricing/:path*", destination: "/contact", permanent: true },
    ];
  },
};

export default nextConfig;
