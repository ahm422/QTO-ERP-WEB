/**
 * Phase 2 — secure POST /chat handler.
 *
 * Flow:
 *   request validation -> input guards -> security classifier -> query
 *   embedding -> Vectorize retrieval -> rerank -> latest D1 context ->
 *   Qwen generation -> output guard -> token cap -> JSON response.
 *
 * Security: only the fixed Vectorize index and the 10 allowlisted D1 tables are
 * reachable. No user input becomes a table name, SQL, index name, or namespace.
 * Internal errors and prompts are never exposed.
 */
import { buildConfig, UNANSWERED_MESSAGE, OUT_OF_SCOPE_MESSAGE } from "../config/index.ts";
import { InputRejectError, validateChatInput } from "../security/input-guards.ts";
import { classifyMessage } from "../security/classifier.ts";
import { guardOutput } from "../security/output-guard.ts";
import { retrieveCandidates } from "../rag/retriever.ts";
import { rerankCandidates } from "../rag/reranker.ts";
import { resolveSources } from "../rag/source-resolver.ts";
import { generateAnswer, enforceMaxTokens } from "../rag/generator.ts";
import { checkRateLimit } from "./rate-limit.ts";
import type { Env } from "../types/env.ts";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function jsonResponse(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extra },
  });
}

function clientKey(request: Request): string {
  const ip =
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return `chat:${ip}`;
}

export async function handleChat(request: Request, env: Env): Promise<Response> {
  const config = buildConfig(env as unknown as Record<string, string | undefined>);

  // 1. Content-Type validation
  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  if (!contentType.includes("application/json")) {
    return jsonResponse({ error: "Unsupported media type" }, 415);
  }

  // 2. Rate limiting (per-isolate; see rate-limit.ts for guarantees)
  const limit = checkRateLimit(clientKey(request), config.rateLimitPerMinute);
  if (!limit.allowed) {
    return jsonResponse({ error: "Too many requests" }, 429, {
      "retry-after": String(limit.retryAfterSeconds),
    });
  }

  // 3. Parse + validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Malformed JSON request" }, 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonResponse({ error: "Malformed request" }, 400);
  }

  let message: string;
  try {
    message = validateChatInput((body as Record<string, unknown>).message, config.maxInputChars);
  } catch (error) {
    if (error instanceof InputRejectError) {
      return jsonResponse({ error: error.reason }, error.status);
    }
    return jsonResponse({ error: "Invalid request" }, 400);
  }

  // 4. Security classification (company scope + prompt injection)
  const verdict = classifyMessage(message);
  if (verdict === "injection") {
    return jsonResponse({ error: "Request rejected" }, 400);
  }
  if (verdict === "out-of-scope") {
    return jsonResponse({ answer: OUT_OF_SCOPE_MESSAGE, sources: [] }, 200);
  }

  // 5. Retrieval -> resolution -> rerank -> generation
  try {
    const candidates = await retrieveCandidates(env, message, config);
    if (candidates.length === 0) {
      return jsonResponse({ answer: UNANSWERED_MESSAGE, sources: [] }, 200);
    }

    const resolved = await resolveSources(env, candidates);
    const usable = resolved
      .filter((entry) => !entry.missing && typeof entry.text === "string" && entry.text.length > 0)
      .map((entry) => ({
        ...entry.candidate,
        text: entry.text as string,
        stale: entry.stale,
      }));

    if (usable.length === 0) {
      return jsonResponse({ answer: UNANSWERED_MESSAGE, sources: [] }, 200);
    }

    const reranked = await rerankCandidates(env, message, usable, config);
    if (reranked.length === 0) {
      return jsonResponse({ answer: UNANSWERED_MESSAGE, sources: [] }, 200);
    }

    const rawAnswer = await generateAnswer(
      env,
      message,
      reranked.map((entry) => ({
        text: entry.text,
        sourceTable: entry.sourceTable,
        sourceId: entry.sourceId,
        chunkId: entry.chunkId,
        documentType: entry.documentType,
      })),
      config,
    );

    const guarded = guardOutput(rawAnswer);
    const limited = enforceMaxTokens(guarded.clean, config.maxOutputTokens);

    // Empty/unusable generation is a safe "no answer", not an error. Keep the
    // response shape consistent with the no-retrieval case.
    if (limited.text === UNANSWERED_MESSAGE) {
      return jsonResponse({ answer: UNANSWERED_MESSAGE, sources: [] }, 200);
    }

    return jsonResponse(
      {
        answer: limited.text,
        sources: reranked.map((entry) => ({
          source_table: entry.sourceTable,
          source_id: entry.sourceId,
          chunk_id: entry.chunkId,
          document_type: entry.documentType,
        })),
      },
      200,
    );
  } catch (error) {
    // Never leak internal errors, prompts, or stack traces.
    console.error(
      "chat_error",
      error instanceof Error ? error.name : "unknown",
    );
    return jsonResponse({ error: "Internal server error" }, 500);
  }
}
