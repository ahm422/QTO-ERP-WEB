/**
 * Core types shared across the chatbot Worker.
 *
 * Pure TypeScript types + small pure helpers. No Workers runtime dependency.
 */
import { isRagAllowedTable } from "./allowlist.ts";

/** Standard vector metadata stored in Vectorize alongside each embedding. */
export interface RagVectorMetadata {
  source_table: string;
  source_id: string;
  chunk_id: string;
  /** Hex of SHA-256 of the normalized text chunk. */
  content_hash: string;
  /** ISO-8601 string of the source `updated_at` (or index time when absent). */
  updated_at: string;
  /** Logical document type label, e.g. "module", "faq", "plan". */
  document_type: string;
  /** Monotonic sync version token. */
  version: string;
}

/** A single chunk of text produced by the chunker. */
export interface Chunk {
  vectorId: string;
  text: string;
  metadata: RagVectorMetadata;
}

/** Result of a single Vectorize retrieval hit. */
export interface Candidate {
  id: string;
  text: string;
  score: number;
  metadata: Record<string, unknown>;
  /** Set after the reranker runs (softmax in [0,1] for bge-reranker). */
  rerankScore?: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  answer: string;
  grounded: boolean;
}

export interface ReindexReport {
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  tables: string[];
  summary: {
    recordsDiscovered: number;
    recordsChanged: number;
    chunksGenerated: number;
    embeddingsGenerated: number;
    vectorsUpserted: number;
    vectorsDeleted: number;
    errors: string[];
  };
  byTable?: Record<
    string,
    { discovered: number; changed: number; upserted: number; deleted: number }
  >;
}

export type LogEvent =
  | { kind: "request"; ip?: string; path: string; method: string; ts: string }
  | { kind: "reject"; reason: string; ts: string }
  | {
      kind: "classify";
      result: "company" | "out-of-scope" | "injection";
      ts: string;
    }
  | { kind: "retrieve"; candidates: number; ts: string }
  | { kind: "rerank"; kept: number; total: number; ts: string }
  | {
      kind: "llm";
      grounded: boolean;
      tokens: number;
      latencyMs: number;
      ts: string;
    }
  | { kind: "error"; message: string; ts: string };

/**
 * Build a deterministic, stable vector ID.
 *
 * Format: `table:source_id:chunk_index`
 *
 * We intentionally do NOT include the content hash in the ID so upserts are
 * idempotent (same record + chunk index → same ID). Changed content is
 * detected by comparing the stored `content_hash` against a fresh hash during
 * sync; when they differ, we upsert the new content under the same stable ID.
 * When a source row is gone, we delete every vector whose ID starts with
 * `table:source_id:`.
 */
export function buildVectorId(
  table: string,
  sourceId: string,
  chunkIndex: number,
): string {
  if (!isRagAllowedTable(table)) {
    throw new Error(`buildVectorId: table "${table}" not in RAG allowlist`);
  }
  if (typeof sourceId !== "string" || sourceId.length === 0) {
    throw new Error("buildVectorId: sourceId must be a non-empty string");
  }
  if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
    throw new Error("buildVectorId: chunkIndex must be a non-negative int");
  }
  return `${table}:${sourceId}:${chunkIndex}`;
}

/** Parse a vector ID back into its components. Returns null if malformed. */
export function parseVectorId(id: string): {
  table: string;
  sourceId: string;
  chunkIndex: number;
} | null {
  const parts = id.split(":");
  if (parts.length < 3) return null;
  const table = parts[0];
  const chunkIndex = Number.parseInt(parts[parts.length - 1], 10);
  const sourceId = parts.slice(1, -1).join(":");
  if (!isRagAllowedTable(table) || sourceId.length === 0 || !Number.isInteger(chunkIndex)) {
    return null;
  }
  return { table, sourceId, chunkIndex };
}

/**
 * Approximate token count (heuristic — ~4 chars per token for English).
 * Good enough for chunk targeting without pulling in a tokenizer.
 */
export function approxTokens(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return Math.ceil(trimmed.length / 4);
}
