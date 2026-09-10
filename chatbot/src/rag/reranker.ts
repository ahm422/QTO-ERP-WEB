/**
 * Phase 2 — cross-encoder reranking.
 *
 * Uses @cf/baai/bge-reranker-base to score candidate text against the original
 * question. Vectorize similarity alone is not trusted; only the top-N passages
 * above the configured score floor survive.
 *
 * The candidate `text` is supplied by the D1 source resolver (latest source of
 * truth), not from user input.
 */
import { buildConfig, type ChatbotConfig } from "../config/index.ts";
import type { RetrievedCandidate } from "./retriever.ts";
import type { Env } from "../types/env.ts";

export interface RerankableCandidate extends RetrievedCandidate {
  text: string;
  stale?: boolean;
}

export interface RerankedCandidate extends RerankableCandidate {
  rerankScore: number;
}

/** Extract the score list from the reranker response across known shapes. */
export function extractRerankerScores(response: unknown): Array<{ id: number; score: number }> {
  const payload = response as Record<string, unknown> | null;
  const raw = Array.isArray(payload?.response)
    ? (payload.response as unknown[])
    : Array.isArray(response)
      ? (response as unknown[])
      : null;
  if (!raw) throw new Error("Invalid reranker response: missing score array.");

  return raw.map((entry, index) => {
    const e = entry as Record<string, unknown>;
    const id = Number.isFinite(Number(e?.id)) ? Number(e.id) : index;
    const score = typeof e?.score === "number" ? e.score : Number(e?.score);
    return { id, score: Number.isFinite(score) ? score : 0 };
  });
}

/**
 * Rerank candidates by relevance to `question`. Returns at most `rerankTopN`
 * candidates scoring >= `minRerankScore`, ordered best-first.
 */
export async function rerankCandidates(
  env: Env,
  question: string,
  candidates: RerankableCandidate[],
  config: ChatbotConfig = buildConfig(env as unknown as Record<string, string | undefined>),
): Promise<RerankedCandidate[]> {
  if (candidates.length === 0) return [];

  const ai = env.AI ?? env.ai;
  if (!ai || typeof ai.run !== "function") {
    throw new Error("Workers AI binding is unavailable: run() is missing.");
  }

  const response = await ai.run(config.rerankerModel, {
    query: question,
    contexts: candidates.map((candidate) => ({ text: candidate.text })),
  });

  const scores = extractRerankerScores(response);
  const scoreById = new Map(scores.map((s) => [s.id, s.score]));

  const ranked = candidates
    .map((candidate, index) => ({
      ...candidate,
      rerankScore: scoreById.get(index) ?? 0,
    }))
    .sort((a, b) => b.rerankScore - a.rerankScore);

  const topN = Math.max(1, config.rerankTopN);
  const selected = ranked.filter((candidate) => candidate.rerankScore >= config.minRerankScore).slice(0, topN);
  if (selected.length > 0) return selected;

  // Bounded fallback. bge-reranker-base relevance scores are query-relative and
  // can be near-zero noise for every candidate even when a clearly relevant,
  // high-similarity passage exists. Selecting `ranked[0]` here would be unsafe:
  // a noise score (~0.001) can rank an unrelated chunk first (observed with a
  // pricing query). Instead fall back to the ORIGINAL Vectorize similarity
  // signal: retain at most ONE candidate — the highest Vectorize similarity
  // among the already-validated candidates — and require that similarity to be
  // strictly greater than 0. All-zero similarities yield no context. These
  // candidates have already passed retrieval, allowlist filtering, D1
  // resolution, freshness/hash validation, and contain real extracted text, so
  // this stays grounded and never fabricates.
  let bestBySimilarity: RerankedCandidate | undefined;
  for (const candidate of ranked) {
    if (candidate.score > 0 && (!bestBySimilarity || candidate.score > bestBySimilarity.score)) {
      bestBySimilarity = candidate;
    }
  }
  return bestBySimilarity ? [bestBySimilarity] : [];
}
