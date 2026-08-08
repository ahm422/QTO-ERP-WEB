/**
 * Minimal Worker entry used only by `wrangler.dev.jsonc` for `next dev`
 * (`initOpenNextCloudflareForDev`). Production uses `cf-worker.ts`.
 */
export default {
  async fetch() {
    return new Response("QTO ERP next-dev bindings stub", { status: 200 });
  },
};
