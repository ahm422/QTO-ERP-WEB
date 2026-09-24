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
import {
  buildConfig,
  UNANSWERED_MESSAGE,
  OUT_OF_SCOPE_MESSAGE,
  GREETING_MESSAGE,
} from "../config/index.ts";
import { InputRejectError, validateChatInput } from "../security/input-guards.ts";
import { classifyMessage } from "../security/classifier.ts";
import { guardOutput } from "../security/output-guard.ts";
import { retrieveCandidates } from "../rag/retriever.ts";
import { rerankCandidates } from "../rag/reranker.ts";
import { resolveSources } from "../rag/source-resolver.ts";
import { generateAnswer, enforceMaxTokens } from "../rag/generator.ts";
import { staticAnswerStream, streamAnswer } from "../rag/stream.ts";
import {
  createRetrievalDiagnostics,
  summarizeDiagnostics,
  type RetrievalOutcome,
} from "../rag/diagnostics.ts";
import { checkRateLimit } from "./rate-limit.ts";
import type { Env } from "../types/env.ts";
import { timingSafeEqual } from "node:crypto";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function jsonResponse(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extra },
  });
}

/** Constant-time string compare (avoids leaking secret length/prefix via timing). */
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still run a same-length compare so a length mismatch doesn't short-circuit faster.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
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
  // 0. Proxy-secret gate. Only the Next.js BFF (`/api/chat`) should ever call
  // this endpoint. When a secret is configured, reject before touching
  // AI/Vectorize/D1 or the rate limiter.
  const expectedSecret = env.CHATBOT_PROXY_SECRET;
  if (expectedSecret) {
    const provided = request.headers.get("X-Chatbot-Proxy-Secret") ?? "";
    if (!safeCompare(provided, expectedSecret)) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
  }

  const config = buildConfig(env as unknown as Record<string, string | undefined>);

  // Opt-in safe retrieval diagnostics (never contains message/context text).
  const diagnostics = config.debugRetrieval ? createRetrievalDiagnostics() : undefined;

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

  // Opt-in NDJSON streaming (see rag/stream.ts). Errors before generation
  // starts are still plain JSON with the usual status codes.
  const stream = (body as Record<string, unknown>).stream === true;

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
    if (stream) return staticAnswerStream(OUT_OF_SCOPE_MESSAGE);
    return jsonResponse({ answer: OUT_OF_SCOPE_MESSAGE, sources: [] }, 200);
  }
  if (verdict === "greeting") {
    if (stream) return staticAnswerStream(GREETING_MESSAGE);
    return jsonResponse({ answer: GREETING_MESSAGE, sources: [] }, 200);
  }

  // 5. Retrieval -> resolution -> rerank -> generation
  const finishDiagnostics = (outcome?: RetrievalOutcome) => {
    if (!diagnostics) return undefined;
    if (outcome) diagnostics.outcome = outcome;
    const summary = summarizeDiagnostics(diagnostics);
    console.log("retrieval_diagnostics", JSON.stringify(summary));
    return summary;
  };
  const respond = (
    payload: Record<string, unknown>,
    status = 200,
    outcome?: RetrievalOutcome,
  ): Response => {
    const summary = finishDiagnostics(outcome);
    if (stream) {
      return staticAnswerStream(payload.answer as string, {
        sources: [],
        ...(summary ? { diagnostics: summary } : {}),
      });
    }
    if (!summary) return jsonResponse(payload, status);
    return jsonResponse({ ...payload, diagnostics: summary }, status);
  };

  try {
    const candidates = await retrieveCandidates(
      env,
      message,
      config,
      diagnostics ? { diagnostics } : {},
    );
    if (candidates.length === 0) {
      const outcome: RetrievalOutcome =
        diagnostics && diagnostics.vectorizeMatches > 0
          ? "all_below_vector_threshold"
          : "no_vectorize_matches";
      return respond({ answer: UNANSWERED_MESSAGE, sources: [] }, 200, outcome);
    }

    const resolved = await resolveSources(env, candidates);
    const usable = resolved
      .filter((entry) => !entry.missing && typeof entry.text === "string" && entry.text.length > 0)
      .map((entry) => ({
        ...entry.candidate,
        text: entry.text as string,
        stale: entry.stale,
      }));

    if (diagnostics) {
      diagnostics.resolutionMissing = resolved.filter((entry) => entry.missing).length;
      diagnostics.resolutionUsable = usable.length;
    }

    if (usable.length === 0) {
      return respond({ answer: UNANSWERED_MESSAGE, sources: [] }, 200, "resolution_empty");
    }

    const reranked = await rerankCandidates(
      env,
      message,
      usable,
      config,
      diagnostics ? { diagnostics } : {},
    );
    if (reranked.length === 0) {
      return respond({ answer: UNANSWERED_MESSAGE, sources: [] }, 200, "rerank_empty");
    }

    if (diagnostics) {
      diagnostics.selected = reranked.map((entry) => ({
        sourceTable: entry.sourceTable,
        sourceId: entry.sourceId,
        chunkId: entry.chunkId,
        vectorId: entry.vectorId,
        vectorScore: entry.score,
        rerankScore: entry.rerankScore,
      }));
    }

    const generationSources = reranked.map((entry) => ({
      text: entry.text,
      sourceTable: entry.sourceTable,
      sourceId: entry.sourceId,
      chunkId: entry.chunkId,
      documentType: entry.documentType,
    }));
    const responseSources = reranked.map((entry) => ({
      source_table: entry.sourceTable,
      source_id: entry.sourceId,
      chunk_id: entry.chunkId,
      document_type: entry.documentType,
    }));

    if (stream) {
      return await streamAnswer(env, message, generationSources, config, (finalText) => {
        const answered = finalText !== UNANSWERED_MESSAGE;
        if (diagnostics) diagnostics.generatorAnswered = answered;
        const summary = finishDiagnostics(answered ? "answered" : "unanswered");
        return {
          type: "done",
          sources: answered ? responseSources : [],
          ...(summary ? { diagnostics: summary } : {}),
        };
      });
    }

    const rawAnswer = await generateAnswer(env, message, generationSources, config);

    const guarded = guardOutput(rawAnswer);
    const limited = enforceMaxTokens(guarded.clean, config.maxOutputTokens);

    // Empty/unusable generation is a safe "no answer", not an error. Keep the
    // response shape consistent with the no-retrieval case.
    if (limited.text === UNANSWERED_MESSAGE) {
      return respond({ answer: UNANSWERED_MESSAGE, sources: [] }, 200, "unanswered");
    }

    if (diagnostics) diagnostics.generatorAnswered = true;

    return respond(
      {
        answer: limited.text,
        sources: responseSources,
      },
      200,
      "answered",
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
