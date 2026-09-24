import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * BFF for the isolated `qto-erp-chatbot` Worker. The browser never calls the
 * Worker directly — only this module does, from the same-origin
 * `POST /api/chat` route. See docs/technical/architecture.md.
 *
 * Transport, in order of preference:
 *   1. Cloudflare service binding `CHATBOT` (production, staging, `npm run dev:workers`)
 *   2. `CHATBOT_URL` env var + plain fetch (plain `npm run dev`, where service
 *      bindings are unavailable — see wrangler.dev.jsonc)
 *   3. Neither configured -> caller should return 503.
 */

const WORKER_TIMEOUT_MS = 45_000;
const FORWARDED_IP_HEADERS = ["CF-Connecting-IP", "x-forwarded-for", "x-real-ip"] as const;

export type ChatbotCallResult =
  | { ok: true; status: number; body: unknown; retryAfter: string | null }
  | { ok: true; status: number; stream: ReadableStream<Uint8Array> }
  | { ok: false; reason: "no_transport" }
  | { ok: false; reason: "timeout" }
  | { ok: false; reason: "network"; error: unknown };

async function getChatbotFetcher(): Promise<Fetcher | undefined> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as { CHATBOT?: Fetcher }).CHATBOT;
  } catch {
    // No Cloudflare context available (e.g. plain `next dev` without the
    // OpenNext dev shim initialized yet) — fall back to CHATBOT_URL.
    return undefined;
  }
}

function forwardedIpHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const name of FORWARDED_IP_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers[name] = value;
  }
  return headers;
}

/** Content type of the Worker's streamed (`stream: true`) answer. */
export const CHAT_STREAM_CONTENT_TYPE = "application/x-ndjson";

/**
 * Calls the chatbot Worker's POST /chat with the visitor's message. With
 * `stream`, a 200 NDJSON answer is returned as an unread body for the route to
 * pass through; error statuses are still JSON and parsed as before.
 */
export async function callChatbot(
  request: Request,
  message: string,
  { stream = false }: { stream?: boolean } = {},
): Promise<ChatbotCallResult> {
  const secret = process.env.CHATBOT_PROXY_SECRET?.trim();
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...forwardedIpHeaders(request),
  };
  if (secret) headers["X-Chatbot-Proxy-Secret"] = secret;

  const body = JSON.stringify(stream ? { message, stream: true } : { message });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WORKER_TIMEOUT_MS);

  try {
    const fetcher = await getChatbotFetcher();

    let response: Response;
    if (fetcher) {
      response = await fetcher.fetch("https://chatbot.internal/chat", {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });
    } else {
      const baseUrl = process.env.CHATBOT_URL?.trim().replace(/\/+$/, "");
      if (!baseUrl) {
        return { ok: false, reason: "no_transport" };
      }
      response = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });
    }

    // The timeout bounds the wait for response headers; once the Worker is
    // streaming, the body is bounded by its own output-token cap.
    if (
      response.status === 200 &&
      response.body &&
      (response.headers.get("content-type") ?? "").includes(CHAT_STREAM_CONTENT_TYPE)
    ) {
      return { ok: true, status: response.status, stream: response.body };
    }

    const retryAfter = response.headers.get("retry-after");
    let parsedBody: unknown = null;
    try {
      parsedBody = await response.json();
    } catch {
      parsedBody = null;
    }

    return { ok: true, status: response.status, body: parsedBody, retryAfter };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, reason: "timeout" };
    }
    return { ok: false, reason: "network", error };
  } finally {
    clearTimeout(timeout);
  }
}

export interface MappedChatResponse {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
}

/**
 * Pure mapping from the Worker's raw status/body to what the BFF returns to
 * the browser. Extracted so it can be unit-tested without a live Worker.
 *
 * - 200/400/413/429/500 pass through as-is (429 keeps Retry-After).
 * - 401 (proxy-secret failure) never reaches the browser as-is — it would
 *   leak that a proxy-auth layer exists. Map it to a generic 502.
 * - Any other/unexpected status is also mapped to a generic 502.
 */
export function mapWorkerResponse(
  status: number,
  body: unknown,
  retryAfter: string | null,
): MappedChatResponse {
  if (status === 200 || status === 400 || status === 413 || status === 500) {
    return { status, body: body ?? { error: "Malformed request" } };
  }
  if (status === 429) {
    const headers: Record<string, string> = {};
    if (retryAfter) headers["retry-after"] = retryAfter;
    return { status, body: body ?? { error: "Too many requests" }, headers };
  }
  return {
    status: 502,
    body: { error: "The assistant is unavailable right now. Please try again." },
  };
}
