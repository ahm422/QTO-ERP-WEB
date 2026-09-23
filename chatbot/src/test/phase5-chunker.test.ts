/**
 * Chunker regression — vector ids must use ONE deterministic, contiguous
 * scheme shared by indexing and pruning (`table:source_id:0..n-1`), including
 * when a document is split into multiple sub-chunks.
 *
 * Runner: node --experimental-strip-types --test
 */
import test from "node:test";
import assert from "node:assert/strict";

import { chunkDocuments } from "../lib/chunker.ts";
import { parseVectorId } from "../types/core.ts";

const UPDATED_AT = "2026-01-01T00:00:00.000Z";
const VERSION = "v1";
const OPTS = { targetTokens: 50, overlapTokens: 10 };

const longText = Array.from(
  { length: 120 },
  (_, i) => `Paragraph ${i}: ${"word ".repeat(40)}`,
).join("\n\n");

const docs = [
  { document_type: "overview", text: "Short overview text." },
  { document_type: "details", text: longText },
  { document_type: "notes", text: "Short notes text." },
];

test("chunker: vector ids are contiguous 0..n-1 even when documents split", async () => {
  const chunks = await chunkDocuments("faqs", "src-1", docs, UPDATED_AT, VERSION, OPTS);

  assert.ok(chunks.length > 3, `expected a split document, got ${chunks.length} chunks`);

  const indices = chunks.map((chunk) => parseVectorId(chunk.vectorId)!.chunkIndex);
  assert.deepEqual(indices, indices.map((_, i) => i), "indices must be contiguous from 0");
  assert.deepEqual(
    chunks.map((chunk) => chunk.vectorId),
    indices.map((i) => `faqs:src-1:${i}`),
  );
});

test("chunker: vector ids are deterministic across runs", async () => {
  const a = await chunkDocuments("faqs", "src-1", docs, UPDATED_AT, VERSION, OPTS);
  const b = await chunkDocuments("faqs", "src-1", docs, UPDATED_AT, VERSION, OPTS);
  assert.deepEqual(b.map((c) => c.vectorId), a.map((c) => c.vectorId));
});
