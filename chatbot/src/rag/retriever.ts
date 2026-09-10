/**
 * Phase 2 — query retrieval.
 *
 * question -> BGE-M3 query embedding -> Vectorize similarity search -> candidates.
 *
 * Security properties:
 * - The index is fixed by the `VECTORIZE` binding (never user-supplied).
 * - The namespace is fixed by config (never user-supplied).
 * - No table name or SQL is ever constructed from the question.
 * - Candidates whose metadata references a non-allowlisted table are dropped.
 */
import { buildConfig, type ChatbotConfig } from "../config/index.ts";
import { embedText } from "./embedding.ts";
import { isRagAllowedTable } from "../types/allowlist.ts";
import type { Env } from "../types/env.ts";

export interface RetrievedCandidate {
  vectorId: string;
  score: number;
  sourceTable: string;
  sourceId: string;
  chunkId: string;
  chunkIndex: number;
  contentHash: string;
  updatedAt: string;
  documentType: string;
  namespace: string;
  version: string;
  sourceTitle?: string;
  question?: string;
  pageKey?: string;
}

export interface RetrieveOptions {
  topK?: number;
  namespace?: string;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value == null) return fallback;
  return String(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** Map a single Vectorize match into a safe, structured candidate. */
export function mapMatchToCandidate(match: unknown): RetrievedCandidate | null {
  if (!match || typeof match !== "object") return null;
  const m = match as Record<string, unknown>;
  const id = asString(m.id);
  if (!id) return null;

  const md = (m.metadata && typeof m.metadata === "object" ? m.metadata : {}) as Record<string, unknown>;
  const sourceTable = asString(md.source_table);
  if (!isRagAllowedTable(sourceTable)) return null;

  const rawIndex = md.chunk_index;
  const chunkIndex = Number.isFinite(Number(rawIndex)) ? Number(rawIndex) : 0;

  return {
    vectorId: id,
    score: typeof m.score === "number" ? m.score : 0,
    sourceTable,
    sourceId: asString(md.source_id),
    chunkId: asString(md.chunk_id),
    chunkIndex,
    contentHash: asString(md.content_hash),
    updatedAt: asString(md.updated_at),
    documentType: asString(md.document_type),
    namespace: asString(md.namespace, "CHATBOT_VECTORS"),
    version: asString(md.version),
    sourceTitle: optionalString(md.source_title),
    question: optionalString(md.question),
    pageKey: optionalString(md.page_key),
  };
}

/**
 * Embed the question and retrieve top-K candidates from the fixed Vectorize index.
 * Throws when required bindings are missing or the embedding is invalid.
 */
export async function retrieveCandidates(
  env: Env,
  question: string,
  config: ChatbotConfig = buildConfig(env as unknown as Record<string, string | undefined>),
  options: RetrieveOptions = {},
): Promise<RetrievedCandidate[]> {
  const vectorize = env.VECTORIZE ?? env.vectorize;
  if (!vectorize || typeof vectorize.query !== "function") {
    throw new Error("Vectorize binding is unavailable: query() is missing.");
  }

  const vector = await embedText(env, question);
  if (!Array.isArray(vector) || vector.length !== config.embeddingDimension) {
    throw new Error(
      `Invalid query embedding dimension: expected ${config.embeddingDimension}.`,
    );
  }

  const topK = Math.max(1, options.topK ?? config.ragTopK);
  const namespace = options.namespace ?? config.vectorizeKey;

  const response = await vectorize.query(vector, {
    topK,
    namespace,
    returnMetadata: "all",
  });

  const matches = response && Array.isArray(response.matches) ? response.matches : [];
  const candidates: RetrievedCandidate[] = [];
  for (const match of matches) {
    const candidate = mapMatchToCandidate(match);
    if (!candidate) continue;
    if (candidate.score < config.minVectorizeScore) continue;
    candidates.push(candidate);
  }
  return candidates.slice(0, topK);
}
