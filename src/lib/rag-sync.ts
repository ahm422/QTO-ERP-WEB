import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Server-side automatic RAG synchronization.
 *
 * After a successful Admin Panel write to one of the chatbot's allowlisted
 * tables, this schedules (fire-and-forget) a call to the chatbot Worker's
 * protected `POST /index` endpoint through the existing `CHATBOT` service
 * binding. The Admin Panel response never waits for indexing, and any chatbot
 * error is swallowed so the write always appears to succeed.
 *
 * Security: `CHATBOT_ADMIN_TOKEN` is a server-side Worker secret on
 * `qto-erp-web`; it is never read from `NEXT_PUBLIC_*` and never sent to the
 * browser. The service binding is server-to-server only.
 *
 * The daily cron (`0 2 * * *`) remains as a reconciliation fallback.
 */

/** The chatbot's allowlisted RAG tables. Keep in sync with chatbot/src/types/allowlist.ts. */
export type RagSyncTable =
  | "blog_posts"
  | "industry_domains"
  | "about_story"
  | "demo_page_content"
  | "contact_support_content"
  | "erp_modules"
  | "solutions"
  | "pricing_plans"
  | "comparison_features"
  | "faqs";

/**
 * Light per-table throttle: coalesces several writes that happen within the
 * same instant (e.g. save + follow-up update) into a single reindex request.
 * Indexing is idempotent (deterministic ids + hash-based `skipUnchanged`), and
 * the daily cron covers anything this best-effort throttle drops.
 */
const MIN_INTERVAL_MS = 1000;
const lastScheduledAt = new Map<RagSyncTable, number>();

async function requestReindex(): Promise<void> {
  try {
    const { env, ctx } = await getCloudflareContext({ async: true });
    const scope = env as { CHATBOT?: Fetcher; CHATBOT_ADMIN_TOKEN?: string };
    const fetcher = scope.CHATBOT;
    const token = scope.CHATBOT_ADMIN_TOKEN?.trim();

    if (!fetcher || !token) {
      console.warn("[rag-sync] CHATBOT binding or CHATBOT_ADMIN_TOKEN missing; skipping reindex");
      return;
    }

    const pending = fetcher
      .fetch("https://chatbot.internal/index", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({}),
      })
      .then((response) => {
        if (!response.ok) {
          console.warn(`[rag-sync] chatbot /index returned ${response.status}`);
        }
      })
      .catch((error: unknown) => {
        console.warn(
          "[rag-sync] chatbot /index request failed:",
          error instanceof Error ? error.name : "unknown",
        );
      });

    ctx.waitUntil(pending);
  } catch (error) {
    console.warn("[rag-sync] unavailable:", error instanceof Error ? error.name : "unknown");
  }
}

/**
 * Trigger RAG synchronization for a table. Call only AFTER the D1 write has
 * succeeded. Never throws.
 */
export async function scheduleRagSync(table: RagSyncTable): Promise<void> {
  try {
    const now = Date.now();
    const last = lastScheduledAt.get(table) ?? 0;
    if (now - last < MIN_INTERVAL_MS) return;
    lastScheduledAt.set(table, now);
    await requestReindex();
  } catch (error) {
    console.warn("[rag-sync] schedule failed:", error instanceof Error ? error.name : "unknown");
  }
}
