/**
 * Phase 2 — resolve retrieved candidates against the latest production D1.
 *
 * D1 is the source of truth. For each candidate we fetch its current row
 * (parameterized, allowlist-enforced), re-extract + re-chunk it with the same
 * Phase 1 logic, and match the stored chunk. The freshly computed content hash
 * is compared with the vector metadata:
 *   - match   -> fresh: use current D1 text.
 *   - differ  -> stale: still use current D1 text (never fabricate) and flag it.
 *   - missing -> the row or chunk no longer exists: drop it, do not invent text.
 *
 * No SQL identifiers are ever derived from user input — the table comes from
 * the (already allowlist-filtered) vector metadata, and the id is a bound param.
 */
import { fetchSingleRecord } from "../lib/d1_reader.ts";
import { chunkDocuments } from "../lib/chunker.ts";
import { sha256 } from "../lib/hashing.ts";
import { isRagAllowedTable } from "../types/allowlist.ts";
import { extractSingleRecord } from "./extractors.ts";
import type { RetrievedCandidate } from "./retriever.ts";
import type { Env } from "../types/env.ts";

export interface ResolvedSource {
  candidate: RetrievedCandidate;
  text: string | null;
  stale: boolean;
  missing: boolean;
}

interface ChunkedSource {
  chunkId: string;
  chunkIndex: number;
  contentHash: string;
  text: string;
}

export interface ResolveOptions {
  targetTokens?: number;
  overlapTokens?: number;
}

async function chunkRow(
  table: string,
  sourceId: string,
  row: Record<string, unknown>,
  opts: ResolveOptions,
): Promise<ChunkedSource[]> {
  const targetTokens = opts.targetTokens ?? 400;
  const overlapTokens = opts.overlapTokens ?? 50;
  const version = await sha256(JSON.stringify(row));
  const updatedAt = String(row.updated_at ?? row.published_at ?? new Date().toISOString());
  const docs = extractSingleRecord(table, row);
  const chunks = await chunkDocuments(table, sourceId, docs, updatedAt, version, {
    targetTokens,
    overlapTokens,
  });
  return chunks.map((chunk) => ({
    chunkId: chunk.metadata.chunk_id,
    chunkIndex: Number.parseInt(chunk.vectorId.split(":").at(-1) ?? "0", 10),
    contentHash: chunk.metadata.content_hash,
    text: chunk.text,
  }));
}

/**
 * Resolve every candidate to current D1 text. Results keep input order and are
 * never collapsed — the caller decides which to use.
 */
export async function resolveSources(
  env: Env,
  candidates: RetrievedCandidate[],
  options: ResolveOptions = {},
): Promise<ResolvedSource[]> {
  const db = env.DB ?? env.db;
  if (!db || typeof db.prepare !== "function") {
    throw new Error("D1 binding is unavailable: prepare() is missing.");
  }

  const targetTokens = options.targetTokens ?? Number(env.CHATBOT_CHUNK_TARGET_TOKENS ?? "400");
  const overlapTokens = options.overlapTokens ?? Number(env.CHATBOT_CHUNK_OVERLAP_TOKENS ?? "50");

  const cache = new Map<string, ChunkedSource[]>();
  const results: ResolvedSource[] = [];

  for (const candidate of candidates) {
    if (!isRagAllowedTable(candidate.sourceTable)) {
      results.push({ candidate, text: null, stale: false, missing: true });
      continue;
    }

    const cacheKey = `${candidate.sourceTable}:${candidate.sourceId}`;
    let chunks = cache.get(cacheKey);
    if (!chunks) {
      const row = (await fetchSingleRecord(db, candidate.sourceTable, candidate.sourceId)) as
        | Record<string, unknown>
        | null;
      chunks = row
        ? await chunkRow(candidate.sourceTable, candidate.sourceId, row, { targetTokens, overlapTokens })
        : [];
      cache.set(cacheKey, chunks);
    }

    const match =
      chunks.find((chunk) => chunk.chunkId === candidate.chunkId) ??
      chunks.find((chunk) => chunk.chunkIndex === candidate.chunkIndex);

    if (!match) {
      results.push({ candidate, text: null, stale: false, missing: true });
      continue;
    }

    const stale = match.contentHash !== candidate.contentHash;
    results.push({ candidate, text: match.text, stale, missing: false });
  }

  return results;
}
