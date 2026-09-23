/**
 * Semantic content-aware chunking.
 *
 * Goal: produce 300-500 token chunks that respect semantic boundaries
 * (FAQ Q+A stay together, titles stay with their content, short records
 * remain single chunks, JSON sections are kept whole where possible).
 *
 * Strategy:
 * 1. If document is under target size → single chunk, no splitting.
 * 2. Otherwise split on structural delimiters (double-newlines, headings).
 * 3. Greedily pack segments into chunks up to target tokens.
 * 4. Add overlap: when a chunk is "full," prepend the last `overlap`
 *    tokens of the previous chunk to the next chunk for context continuity.
 */
import { approxTokens } from "../types/core.ts";
import type { Chunk } from "../types/core.ts";
import { buildVectorId } from "../types/core.ts";
import { sha256 } from "./hashing.ts";

export interface ChunkOptions {
  targetTokens?: number;
  overlapTokens?: number;
}

/**
 * Extract raw, un-chunked text documents from an extracted record.
 * The extractor (extractors.ts) already produces semantically-grouped
 * documents. This function further splits ONLY those that exceed the
 * target token size.
 */
export async function chunkDocuments(
  table: string,
  sourceId: string,
  docs: Array<{ document_type: string; text: string }>,
  updatedAt: string,
  version: string,
  opts: ChunkOptions = {},
): Promise<Chunk[]> {
  const targetTokens = opts.targetTokens ?? 400;
  const overlapTokens = opts.overlapTokens ?? 50;
  const chunks: Chunk[] = [];

  for (let i = 0; i < docs.length; i++) {
    const { document_type, text } = docs[i];
    const tokens = approxTokens(text);

    if (tokens <= targetTokens) {
      // Short document — keep as single chunk. The vector index is a single,
      // contiguous running counter (see the long-document branch) so indexing
      // and pruning agree on `table:source_id:0..n-1`.
      const chunkId = `${document_type}_${i}`;
      chunks.push({
        vectorId: buildVectorId(table, sourceId, chunks.length),
        text,
        metadata: {
          source_table: table,
          source_id: sourceId,
          chunk_id: chunkId,
          content_hash: await sha256(text),
          updated_at: updatedAt,
          document_type,
          version,
        },
      });
      continue;
    }

    // Long document — split on paragraph boundaries, then pack greedily.
    const segments = splitOnBoundaries(text);
    const subChunks = packSegments(segments, targetTokens, overlapTokens);

    for (let j = 0; j < subChunks.length; j++) {
      const chunkId = `${document_type}_${i}_${j}`;
      chunks.push({
        // Same contiguous counter as the short-document branch: deterministic
        // and compatible with `listSourceVectorIds` / prune (`0..n-1`).
        vectorId: buildVectorId(table, sourceId, chunks.length),
        text: subChunks[j],
        metadata: {
          source_table: table,
          source_id: sourceId,
          chunk_id: chunkId,
          content_hash: await sha256(subChunks[j]),
          updated_at: updatedAt,
          document_type,
          version,
        },
      });
    }
  }

  return chunks;
}

/**
 * Split text on paragraph / heading boundaries.
 * We treat:
 *   - "\n\n" (empty line)
 *   - lines starting with "#" (markdown headings)
 *   - lines starting with "Q:" or "A:" (FAQ patterns — keep each Q+A pair together)
 *   - lines starting with "- " or "* " (list items — each is a mini-segment)
 *
 * Returns an array of non-empty text segments.
 */
function splitOnBoundaries(text: string): string[] {
  const lines = text.split("\n");
  const segments: string[] = [];
  let current: string[] = [];

  const flush = () => {
    const seg = current.join("\n").trim();
    if (seg) segments.push(seg);
    current = [];
  };

  // Track whether we're inside a Q+A pair to keep them together.
  let inQa: "q" | "a" | null = null;

  for (const line of lines) {
    const isHeading = /^#{1,6}\s/.test(line);
    const isQaQ = /^Q:\s/.test(line.trim());
    const isQaA = /^A:\s/.test(line.trim());
    const isList = /^[-*]\s/.test(line.trim());
    const isEmpty = line.trim() === "";

    // If we're in a Q or A and the next marker is the complementary one, keep together.
    if (inQa) {
      if (inQa === "q" && isQaA) {
        current.push(line);
        inQa = "a";
        continue;
      }
      if (inQa === "a" && (isQaQ || isHeading || isEmpty)) {
        // End of the QA pair — flush it.
        current.push(line);
        flush();
        inQa = null;
        continue;
      }
      current.push(line);
      continue;
    }

    if (isQaQ) {
      current.push(line);
      inQa = "q";
      continue;
    }
    if (isEmpty) {
      flush();
      continue;
    }
    if (isHeading) {
      flush();
      current.push(line);
      continue;
    }
    current.push(line);
  }

  flush();
  return segments;
}

/**
 * Greedily pack segments into chunks up to `targetTokens`, with `overlapTokens`
 * carried from the end of the previous chunk into the start of the next.
 */
function packSegments(
  segments: string[],
  targetTokens: number,
  overlapTokens: number,
): string[] {
  if (segments.length === 0) return [];

  const chunks: string[] = [];
  let current: string[] = [];
  let currentTokens = 0;

  for (const seg of segments) {
    const segTokens = approxTokens(seg);

    // If a single segment exceeds the target, force it as its own chunk.
    if (segTokens > targetTokens) {
      if (current.length > 0) {
        chunks.push(current.join("\n"));
        current = [];
        currentTokens = 0;
      }
      chunks.push(seg);
      continue;
    }

    if (currentTokens + segTokens > targetTokens && current.length > 0) {
      const chunkText = current.join("\n");
      chunks.push(chunkText);
      // Carry overlap: take the tail of the just-completed chunk.
      const tail = tailTokens(chunkText, overlapTokens);
      current = tail ? [tail] : [];
      currentTokens = tail ? approxTokens(tail) : 0;
    }

    current.push(seg);
    currentTokens += segTokens;
  }

  if (current.length > 0) {
    chunks.push(current.join("\n"));
  }

  return chunks;
}

/**
 * Return the last `n` tokens (approximate: last ~4*n characters) of a string.
 * Used for overlap between chunks.
 */
function tailTokens(text: string, n: number): string {
  if (n <= 0) return "";
  const chars = n * 4; // approxTokens inverse
  if (text.length <= chars) return text;
  // Try to cut at a word boundary to avoid mid-word overlap.
  const slice = text.slice(text.length - chars);
  const firstSpace = slice.indexOf(" ");
  return firstSpace >= 0 ? slice.slice(firstSpace + 1) : slice;
}
