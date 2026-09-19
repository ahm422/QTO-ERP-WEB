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
import type { RetrievalDiagnostics } from "./diagnostics.ts";
import type { Env } from "../types/env.ts";

export interface RerankOptions {
  /** Optional safe diagnostics sink (opt-in). */
  diagnostics?: RetrievalDiagnostics;
}

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
 * Pick the candidate with the strongest Vectorize similarity (> 0), or
 * undefined when no candidate has a positive similarity.
 *
 * `ranked` is supplied sorted by rerankScore descending, so the strict `>`
 * comparison keeps the highest rerank score among equal-similarity ties.
 */
export function strongestByVectorScore(
  ranked: RerankedCandidate[],
): RerankedCandidate | undefined {
  let best: RerankedCandidate | undefined;
  for (const candidate of ranked) {
    if (candidate.score > 0 && (!best || candidate.score > best.score)) {
      best = candidate;
    }
  }
  return best;
}

/**
 * Rerank candidates by relevance to `question`. Returns at most `rerankTopN`
 * candidates, ordered best-first.
 *
 * Selection policy:
 *   1. Keep candidates scoring >= `minRerankScore`, capped at `rerankTopN`.
 *   2. Protect the strongest Vectorize-similarity candidate: bge-reranker-base
 *      scores are query-relative and can be near-zero noise, so a clearly
 *      relevant, high-similarity passage (e.g. a published FAQ) must not vanish
 *      solely because the cross-encoder ranked it just below the floor or past
 *      the top-N cutoff. It is inserted within the existing top-N budget
 *      (replacing the weakest reranked entry when full), never added beyond it.
 *   3. If nothing clears the floor, fall back to that single strongest
 *      Vectorize candidate (positive similarity only) or no context.
 *
 * All returned candidates have already passed retrieval, allowlist filtering,
 * D1 resolution, and freshness validation, and carry real extracted text, so
 * this stays grounded and never fabricates.
 */
export async function rerankCandidates(
  env: Env,
  question: string,
  candidates: RerankableCandidate[],
  config: ChatbotConfig = buildConfig(env as unknown as Record<string, string | undefined>),
  options: RerankOptions = {},
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
  const aboveFloor = ranked.filter((candidate) => candidate.rerankScore >= config.minRerankScore);
  const selected = aboveFloor.slice(0, topN);
  const strongest = strongestByVectorScore(ranked);

  const diagnostics = options.diagnostics;
  if (diagnostics) {
    diagnostics.rerankScored = ranked.length;
    diagnostics.rerankAboveFloor = aboveFloor.length;
    diagnostics.rerankDroppedByTopN = Math.max(0, aboveFloor.length - topN);
  }

  if (selected.length > 0) {
    if (strongest && !selected.some((candidate) => candidate.vectorId === strongest.vectorId)) {
      if (selected.length >= topN) {
        selected[selected.length - 1] = strongest;
      } else {
        selected.push(strongest);
      }
      if (diagnostics) diagnostics.protectedVectorIds.push(strongest.vectorId);
    }
    return selected;
  }

  if (diagnostics) diagnostics.rerankFallbackUsed = true;
  return strongest ? [strongest] : [];
}
