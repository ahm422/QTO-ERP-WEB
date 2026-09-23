import { handleChat } from "./chat/handler.ts";
import { authorizeAdmin } from "./chat/admin-auth.ts";
import { runReindex, type ReindexOptions } from "./rag/reindex.ts";
import type { Env } from "./types/env.ts";

const response = { status: "ok", service: "qto-erp-chatbot" };

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

/** Validate and normalise the optional `POST /index` JSON body. */
function parseIndexOptions(body: unknown): ReindexOptions | { error: string } {
  if (body == null) return {};
  if (typeof body !== "object" || Array.isArray(body)) return { error: "Malformed request" };

  const input = body as Record<string, unknown>;
  const options: ReindexOptions = {};

  if (input.tables !== undefined) {
    if (!Array.isArray(input.tables) || input.tables.some((t) => typeof t !== "string")) {
      return { error: "tables must be an array of strings" };
    }
    options.tables = input.tables as string[];
  }
  if (input.dryRun !== undefined) {
    if (typeof input.dryRun !== "boolean") return { error: "dryRun must be a boolean" };
    options.dryRun = input.dryRun;
  }
  if (input.prune !== undefined) {
    if (typeof input.prune !== "boolean") return { error: "prune must be a boolean" };
    options.prune = input.prune;
  }
  if (input.skipUnchanged !== undefined) {
    if (typeof input.skipUnchanged !== "boolean") {
      return { error: "skipUnchanged must be a boolean" };
    }
    options.skipUnchanged = input.skipUnchanged;
  }

  return options;
}

/** Protected operational endpoint: rebuild the index on demand. */
async function handleIndex(request: Request, env: Env): Promise<Response> {
  const auth = authorizeAdmin(request, env);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status);
  }

  let body: unknown = null;
  const raw = await request.text();
  if (raw.trim().length > 0) {
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: "Malformed JSON request" }, 400);
    }
  }

  const parsed = parseIndexOptions(body);
  if ("error" in parsed) {
    return json({ error: parsed.error }, 400);
  }

  try {
    const result = await runReindex(env, parsed);
    return json(result, 200);
  } catch (error) {
    console.error("index_error", error instanceof Error ? error.name : "unknown");
    return json({ error: "Internal server error" }, 500);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return Response.json(response);
    }

    if (url.pathname === "/chat") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return handleChat(request, env);
    }

    if (url.pathname === "/index") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }
      return handleIndex(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },

  /**
   * Cron reindex: picks up added/edited D1 content and prunes deleted rows.
   * Schedule is defined in wrangler.jsonc (`triggers.crons`).
   */
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      runReindex(env, { prune: true }).catch((error) => {
        console.error(
          "scheduled_reindex_error",
          error instanceof Error ? error.name : "unknown",
        );
      }),
    );
  },
};
