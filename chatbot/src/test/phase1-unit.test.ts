import test from "node:test";
import assert from "node:assert/strict";

import { RAG_ALLOWED_TABLES, isRagAllowedTable } from "../types/allowlist.ts";
import { buildVectorId, parseVectorId, approxTokens } from "../types/core.ts";
import { sha256, hashRow } from "../lib/hashing.ts";
import { chunkDocuments } from "../lib/chunker.ts";
import { embedTexts, extractEmbeddingRows, BGE_M3_DIMENSION } from "../rag/embedding.ts";
import { buildVectorMetadata, vectorMatchesCurrentHash } from "../rag/vectorize.ts";

test("allowed-table enforcement rejects prohibited D1 tables", () => {
  for (const table of [
    "users",
    "refresh_tokens",
    "password_reset_tokens",
    "contact_inquiries",
    "demo_requests",
    "newsletter_subscribers",
    "subscriptions",
  ]) {
    assert.equal(isRagAllowedTable(table), false, `${table} should not be allowed`);
  }
  for (const table of RAG_ALLOWED_TABLES) {
    assert.equal(isRagAllowedTable(table), true, `${table} should be allowed`);
  }
});

test("vector IDs are deterministic and parse back correctly", () => {
  const id = buildVectorId("faqs", "42", 0);
  assert.equal(id, "faqs:42:0");
  const parsed = parseVectorId(id);
  assert.ok(parsed);
  assert.equal(parsed?.table, "faqs");
  assert.equal(parsed?.sourceId, "42");
  assert.equal(parsed?.chunkIndex, 0);
});

test("content hashing is deterministic", async () => {
  const input = { title: "Pricing", description: "A plan for growth" };
  const hashA = await hashRow(input);
  const hashB = await hashRow(input);
  const hashC = await sha256(JSON.stringify(input));
  assert.equal(hashA, hashB);
  assert.equal(hashA, hashC);
});

test("chunkDocuments produces stable text segments for embedding", async () => {
  const chunks = await chunkDocuments(
    "faqs",
    "faq-1",
    [{ document_type: "faq", text: "Q: What is the price?\nA: It starts at $49.\n\nQ: Do you support exports?\nA: Yes, CSV and XLSX are available." }],
    "2026-09-10T00:00:00.000Z",
    "v1",
    { targetTokens: 40, overlapTokens: 10 },
  );

  assert.ok(chunks.length > 0);
  assert.ok(chunks.every((chunk) => typeof chunk.text === "string" && chunk.text.trim().length > 0));
  assert.ok(chunks.every((chunk) => chunk.text.length <= 4000));
});

test("embedding validation rejects wrong dimension", async () => {
  const fakeEnv = {
    AI: {
      async run() {
        return { data: [[1, 2, 3]] };
      },
    },
  } as any;

  await assert.rejects(() => embedTexts(fakeEnv, ["bad text"]), /expected 1024/i);
});

test("embedding extraction accepts valid batch response", async () => {
  const values = Array.from({ length: BGE_M3_DIMENSION }, (_, i) => i + 1);
  const rows = extractEmbeddingRows({ data: [values, values] }, 2);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].length, BGE_M3_DIMENSION);
  assert.equal(rows[1].length, BGE_M3_DIMENSION);
});

test("vector metadata construction keeps provenance and excludes sensitive fields", () => {
  const metadata = buildVectorMetadata({
    table: "faqs",
    sourceId: "42",
    chunkId: "faq_0",
    chunkIndex: 0,
    contentHash: "abc123",
    updatedAt: "2026-09-10T00:00:00.000Z",
    documentType: "faq",
    version: "v1",
    sourceTitle: "ERP FAQ",
    question: "How do I export reports?",
    namespace: "CHATBOT_VECTORS",
  });

  assert.equal(metadata.source_table, "faqs");
  assert.equal(metadata.source_id, "42");
  assert.equal(metadata.document_type, "faq");
  assert.equal(metadata.chunk_index, 0);
  assert.equal(metadata.content_hash, "abc123");
  assert.equal(metadata.namespace, "CHATBOT_VECTORS");
  assert.equal("email" in metadata, false);
});

test("unchanged content is recognized as unchanged", () => {
  const existing = { content_hash: "abc123" } as Record<string, unknown>;
  assert.equal(vectorMatchesCurrentHash(existing, "abc123"), true);
  assert.equal(vectorMatchesCurrentHash(existing, "def456"), false);
});

test("approxTokens remains a stable heuristic for chunk sizing", () => {
  assert.equal(approxTokens(""), 0);
  const count = approxTokens("the quick brown fox jumps over the lazy dog");
  assert.ok(count > 0 && count < 20);
});
