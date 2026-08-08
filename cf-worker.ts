// @ts-nocheck — OpenNext emits .open-next/worker.js after `next build`; exclude alone is not enough because worker-configuration.d.ts imports this module.
import openNextWorker from "./.open-next/worker.js";
export { DOQueueHandler } from "./.open-next/worker.js";
export { DOShardedTagCache } from "./.open-next/worker.js";
export { BucketCachePurge } from "./.open-next/worker.js";

import { cleanupExpiredRefreshTokens } from "./src/lib/refresh-token-cleanup";

const worker = {
  fetch: openNextWorker.fetch.bind(openNextWorker),
  async scheduled(
    _controller: ScheduledController,
    env: CloudflareEnv,
    ctx: ExecutionContext,
  ) {
    ctx.waitUntil(
      cleanupExpiredRefreshTokens(env.DB).then((count) => {
        console.log(`[cron] Removed ${count} expired/revoked refresh_tokens`);
      }),
    );
  },
};

export default worker;
