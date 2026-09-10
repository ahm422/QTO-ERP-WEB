/**
 * Phase 1 incremental / idempotent indexing validation tests.
 *
 * All tests use mocked D1, Workers AI, and Vectorize bindings.
 * No production data is touched, no production deletion is executed, and no
 * full reindex runs (every indexing call passes `tables: [...]` explicitly).
 *
 * Style reference: src/test/phase1-unit.test.ts
 * Runner: node --experimental-strip-types --test
 */
import test from "node:test";
import assert from "node:assert/strict";

import { RAG_ALLOWED_TABLES, isRagAllowedTable } from "../types/allowlist.ts";
import { buildVectorId, parseVectorId } from "../types/core.ts";
import { chunkDocuments } from "../lib/chunker.ts";
import { fetchSingleRecord } from "../lib/d1_reader.ts";
import { extractSingleRecord } from "../rag/extractors.ts";
import { BGE_M3_DIMENSION } from "../rag/embedding.ts";
import {
  listSourceVectorIds,
  deleteSourceVectors,
  deleteStaleVectors,
} from "../rag/vectorize.ts";
import { indexApprovedTables } from "../rag/indexer.ts";
import type { Env } from "../types/env.ts";

// ---------------------------------------------------------------------------
// Shared fakes
// ---------------------------------------------------------------------------

type StoredVector = { values: number[]; metadata: Record<string, unknown> };

/** 1024-dim fake embedding with a 1.0 at `n` so stored vectors are distinguishable. */
function fakeEmbedding(n: number): number[] {
  return Array.from({ length: BGE_M3_DIMENSION }, (_, i) => (i === n ? 1 : 0));
}

/** Treat a plain mock bundle as the Worker `Env` (bindings are `any` in Env). */
function asEnv(bundle: Record<string, unknown>): Env {
  return bundle as unknown as Env;
}

/** Mock D1 binding. Records every prepare()/all() call and returns `rows` for any query. */
function makeMockDb(rows: Array<Record<string, unknown>>) {
  const calls: Array<{ sql: string; table: string | null }> = [];
  const db = {
    prepare(sql: string) {
      const match = sql.match(/(?:FROM|INTO|UPDATE)\s+([a-zA-Z_]+)/i);
      const table = match ? (match[1] as string) : null;
      return {
        all: async (_params?: Record<string, unknown>) => {
          calls.push({ sql, table });
          return rows;
        },
      };
    },
  };
  return { db, calls };
}

/**
 * Mock Workers AI binding. Mirrors the real BGE-M3 response shape by returning
 * exactly ONE embedding per input text: `{ data: [vector, ...] }`.
 * `runCalls` lets tests assert whether embedding actually happened.
 */
function makeMockAi(embeddingIndex: number) {
  let runCalls = 0;
  const ai = {
    async run(_model: string, opts: Record<string, unknown>) {
      runCalls += 1;
      const texts = Array.isArray(opts?.text) ? (opts.text as string[]) : [];
      return { data: texts.map(() => fakeEmbedding(embeddingIndex)) };
    },
    get runCalls() {
      return runCalls;
    },
  };
  return ai;
}

/** Mock Vectorize binding backed by an in-memory Map (never touches production). */
function makeMockVectorize() {
  const store = new Map<string, StoredVector>();
  let upsertCalls = 0;
  let deleteCalls = 0;
  const vectorize = {
    async upsert(vectors: Array<{ id: string; values: number[]; metadata: Record<string, unknown> }>) {
      upsertCalls += 1;
      for (const v of vectors) store.set(v.id, { values: v.values, metadata: v.metadata });
      // Intentionally mirror the real mutation response (no `ids`).
      return { mutationId: `mock-mutation-${upsertCalls}` };
    },
    async getByIds(ids: string[]) {
      return ids.filter((id) => store.has(id)).map((id) => ({ id, ...store.get(id)! }));
    },
    async deleteByIds(ids: string[]) {
      deleteCalls += 1;
      const deleted: string[] = [];
      for (const id of ids) if (store.delete(id)) deleted.push(id);
      return { ids: deleted };
    },
    get upsertCalls() {
      return upsertCalls;
    },
    get deleteCalls() {
      return deleteCalls;
    },
    store,
  };
  return vectorize;
}

/** Build an env wired to the fakes. */
function makeEnv(rows: Array<Record<string, unknown>>, embeddingIndex: number) {
  const { db, calls } = makeMockDb(rows);
  const ai = makeMockAi(embeddingIndex);
  const vectorize = makeMockVectorize();
  const env = asEnv({
    DB: db,
    AI: ai,
    VECTORIZE: vectorize,
    CHATBOT_VECTORIZE_KEY: "CHATBOT_VECTORS",
    CHATBOT_CHUNK_TARGET_TOKENS: "200",
    CHATBOT_CHUNK_OVERLAP_TOKENS: "30",
    CHATBOT_EMBEDDING_BATCH_SIZE: "32",
  });
  return { env, db, calls, ai, vectorize };
}

/** Compute the exact chunks the indexer will produce for a single record. */
async function chunksFor(table: string, sourceId: string, record: Record<string, unknown>) {
  const docs = extractSingleRecord(table, record);
  return chunkDocuments(table, sourceId, docs, "2026-09-10T00:00:00.000Z", "v1", {
    targetTokens: 200,
    overlapTokens: 30,
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SHORT_ANSWER =
  "The Growth plan starts at $99/month. It includes unlimited users, CSV export, and priority support.";
const CHANGED_ANSWER =
  "The Growth plan has been restructured. It now starts at $149/month and includes a free onboarding call.";

function faqFixture(answer: string): Record<string, unknown> {
  return {
    id: "faq-1",
    page_key: "pricing",
    question: "What is the price of the Growth plan?",
    answer,
    published: 1,
    updated_at: "2026-09-10T00:00:00.000Z",
  };
}

/** A rich module record whose extractor emits MANY documents -> many chunks. */
function erpModuleFixture(): Record<string, unknown> {
  return {
    id: "mod-1",
    slug: "inventory",
    name: "Inventory Management",
    short_description: "Track stock across warehouses in real time.",
    best_for: "Wholesale and distribution teams",
    highlights: JSON.stringify(["Real-time stock", "Reorder alerts", "Barcode scanning"]),
    hero_headline: "Inventory that stays in sync",
    hero_subheadline: "One source of truth for every SKU",
    about_title: "About Inventory",
    about_description: "Manage stock across locations.",
    features: JSON.stringify([
      { title: "Multi-warehouse", description: "Track stock across sites" },
      { title: "Reorder points", description: "Automatically replenish" },
    ]),
    capabilities: JSON.stringify([{ title: "Barcode", description: "Scan and count" }]),
    problems: JSON.stringify([{ title: "Stockouts", description: "Avoid lost sales" }]),
    use_cases: JSON.stringify([{ title: "Distribution", description: "Ship faster" }]),
    testimonials: JSON.stringify([{ quote: "Great", author: "A", role: "Ops" }]),
    faqs: JSON.stringify([{ question: "Does it scan?", answer: "Yes" }]),
    published: 1,
    updated_at: "2026-09-10T00:00:00.000Z",
  };
}

// ---------------------------------------------------------------------------
// A. First indexing — full pipeline
// ---------------------------------------------------------------------------

test("A: first indexing runs the full mocked pipeline (read → chunk → hash → embed → upsert)", async () => {
  const row = faqFixture(SHORT_ANSWER);
  const expectedChunks = await chunksFor("faqs", "faq-1", row);
  const { env, calls, ai, vectorize } = makeEnv([row], 0);

  const summary = await indexApprovedTables(env, { tables: ["faqs"], skipUnchanged: false });

  assert.equal(summary.rowsProcessed, 1, `rowsProcessed=${summary.rowsProcessed}`);
  assert.equal(summary.chunksCreated, expectedChunks.length, `chunksCreated=${summary.chunksCreated}`);
  assert.equal(summary.embeddingsGenerated, expectedChunks.length, `embeddingsGenerated=${summary.embeddingsGenerated}`);
  assert.equal(summary.vectorsUpserted, expectedChunks.length, `vectorsUpserted=${summary.vectorsUpserted}`);
  assert.equal(summary.rowsSkipped, 0, `rowsSkipped=${summary.rowsSkipped}`);
  assert.equal(summary.failures.length, 0, `failures=${JSON.stringify(summary.failures)}`);

  const primaryId = buildVectorId("faqs", "faq-1", 0);
  assert.ok(vectorize.store.has(primaryId), `store should contain ${primaryId}`);
  const stored = vectorize.store.get(primaryId)!;
  assert.equal(stored.values.length, BGE_M3_DIMENSION);
  assert.equal(stored.metadata.source_table, "faqs");
  assert.equal(stored.metadata.source_id, "faq-1");
  assert.equal(typeof stored.metadata.content_hash, "string");
  assert.equal((stored.metadata.content_hash as string).length, 64, "content_hash must be 64-char SHA-256 hex");

  assert.equal(ai.runCalls, 1, "AI.run must be called exactly once for one batch");
  assert.equal(vectorize.upsertCalls, 1, "Vectorize.upsert must be called exactly once");

  for (const call of calls) {
    assert.ok(/^select/i.test(call.sql), `D1 must only be read (SELECT), got: ${call.sql}`);
  }
});

// ---------------------------------------------------------------------------
// B. Unchanged content — skip
// ---------------------------------------------------------------------------

test("B: unchanged content skips embedding/upsert and does not duplicate vectors", async () => {
  const row = faqFixture(SHORT_ANSWER);
  const chunks = await chunksFor("faqs", "faq-1", row);

  // Run 1: fresh index, seeds the vector store.
  const run1 = makeEnv([row], 0);
  const summary1 = await indexApprovedTables(run1.env, { tables: ["faqs"], skipUnchanged: true });
  assert.equal(summary1.vectorsUpserted, chunks.length, `run1 upserts=${summary1.vectorsUpserted}`);
  assert.equal(run1.ai.runCalls, 1, "run1 embedded");

  // Run 2: same content, same existing vectors, different embedding marker so a
  // re-embed would be detectable.
  const run2 = makeEnv([row], 1);
  for (const [id, entry] of run1.vectorize.store) run2.vectorize.store.set(id, entry);

  const summary2 = await indexApprovedTables(run2.env, { tables: ["faqs"], skipUnchanged: true });

  assert.equal(summary2.rowsProcessed, 1, `run2 rowsProcessed=${summary2.rowsProcessed}`);
  assert.equal(summary2.vectorsUpserted, 0, `run2 upserts=${summary2.vectorsUpserted} (must be 0)`);
  assert.equal(summary2.rowsSkipped, chunks.length, `run2 skipped=${summary2.rowsSkipped}`);
  assert.equal(run2.ai.runCalls, 0, "run2 must NOT call AI (skipped before embedding)");
  assert.equal(run2.vectorize.upsertCalls, 0, "run2 must NOT call upsert");
  assert.equal(run2.vectorize.store.size, chunks.length, "no duplicate vectors created");

  const primaryId = buildVectorId("faqs", "faq-1", 0);
  const storedHash = run2.vectorize.store.get(primaryId)!.metadata.content_hash;
  assert.equal(storedHash, chunks[0].metadata.content_hash, "stored hash equals fresh chunk hash (idempotent)");
});

// ---------------------------------------------------------------------------
// C. Changed content — reindex
// ---------------------------------------------------------------------------

test("C: changed content yields a new hash and reindexes under the same deterministic id", async () => {
  const primaryId = buildVectorId("faqs", "faq-1", 0);

  const run1 = makeEnv([faqFixture(SHORT_ANSWER)], 0);
  const summary1 = await indexApprovedTables(run1.env, { tables: ["faqs"], skipUnchanged: true });
  assert.equal(summary1.vectorsUpserted, 1, `run1 upserts=${summary1.vectorsUpserted}`);
  const oldHash = run1.vectorize.store.get(primaryId)!.metadata.content_hash;

  const run2 = makeEnv([faqFixture(CHANGED_ANSWER)], 1);
  run2.vectorize.store.set(primaryId, run1.vectorize.store.get(primaryId)!);
  const summary2 = await indexApprovedTables(run2.env, { tables: ["faqs"], skipUnchanged: true });

  assert.equal(summary2.vectorsUpserted, 1, `run2 upserts=${summary2.vectorsUpserted} (changed content reindexes)`);
  assert.equal(summary2.rowsSkipped, 0, `run2 skipped=${summary2.rowsSkipped}`);
  assert.equal(run2.ai.runCalls, 1, "run2 embedded the new content");
  assert.equal(run2.vectorize.upsertCalls, 1, "run2 upserted");

  const newHash = run2.vectorize.store.get(primaryId)!.metadata.content_hash;
  assert.notEqual(oldHash, newHash, "content hash must change when content changes");
  assert.equal(run2.vectorize.store.get(primaryId)!.metadata.source_id, "faq-1");

  // Deterministic id is unchanged across content edits.
  assert.equal(primaryId, buildVectorId("faqs", "faq-1", 0));
  const parsed = parseVectorId(primaryId)!;
  assert.equal(parsed.table, "faqs");
  assert.equal(parsed.sourceId, "faq-1");
  assert.equal(parsed.chunkIndex, 0);
});

// ---------------------------------------------------------------------------
// D. Deterministic vector IDs
// ---------------------------------------------------------------------------

test("D: vector IDs are deterministic", () => {
  const a = buildVectorId("faqs", "faq-1", 0);
  assert.equal(a, buildVectorId("faqs", "faq-1", 0), "same table+source+chunk -> same id");
  assert.notEqual(a, buildVectorId("faqs", "faq-1", 1), "different chunk -> different id");
  assert.notEqual(a, buildVectorId("faqs", "faq-2", 0), "different source -> different id");
  assert.notEqual(a, buildVectorId("erp_modules", "faq-1", 0), "different table -> different id");
  // Content never participates in the id.
  assert.equal(a, buildVectorId("faqs", "faq-1", 0));

  for (const id of [a, buildVectorId("faqs", "faq-1", 1), buildVectorId("faqs", "faq-2", 0)]) {
    const parsed = parseVectorId(id);
    assert.ok(parsed, `id ${id} must parse`);
    assert.equal(typeof parsed.table, "string");
    assert.equal(typeof parsed.sourceId, "string");
    assert.equal(typeof parsed.chunkIndex, "number");
  }
});

// ---------------------------------------------------------------------------
// E. Multi-chunk
// ---------------------------------------------------------------------------

test("E: multi-chunk documents generate correct embeddings, unique ids, and full metadata", async () => {
  const row = erpModuleFixture();
  const expectedChunks = await chunksFor("erp_modules", "mod-1", row);
  assert.ok(expectedChunks.length >= 2, `expected >=2 chunks, got ${expectedChunks.length}`);

  const { env, ai, vectorize } = makeEnv([row], 0);
  const summary = await indexApprovedTables(env, { tables: ["erp_modules"], skipUnchanged: false });

  assert.equal(summary.chunksCreated, expectedChunks.length, `chunksCreated=${summary.chunksCreated}`);
  assert.equal(summary.embeddingsGenerated, expectedChunks.length, `embeddingsGenerated=${summary.embeddingsGenerated}`);
  assert.equal(summary.vectorsUpserted, expectedChunks.length, `vectorsUpserted=${summary.vectorsUpserted}`);
  assert.equal(ai.runCalls, 1, "all chunks embedded in a single batch");

  const seenIds = new Set<string>();
  for (let i = 0; i < expectedChunks.length; i++) {
    const id = buildVectorId("erp_modules", "mod-1", i);
    assert.ok(vectorize.store.has(id), `store should contain ${id}`);
    assert.ok(!seenIds.has(id), `id ${id} must be unique`);
    seenIds.add(id);

    const stored = vectorize.store.get(id)!;
    assert.equal(stored.values.length, BGE_M3_DIMENSION);
    assert.equal(stored.metadata.source_table, "erp_modules");
    assert.equal(stored.metadata.source_id, "mod-1");
    assert.equal(typeof stored.metadata.chunk_id, "string");
    assert.equal(stored.metadata.chunk_index, i);
    assert.equal(typeof stored.metadata.content_hash, "string");
    assert.equal(typeof stored.metadata.updated_at, "string");
    assert.equal(typeof stored.metadata.document_type, "string");
    assert.equal(typeof stored.metadata.version, "string");
  }

  const indices = [...seenIds].map((id) => parseVectorId(id)!.chunkIndex).sort((x, y) => x - y);
  for (let i = 0; i < indices.length; i++) {
    assert.equal(indices[i], i, "chunk_index sequence must be contiguous from 0");
  }
});

// ---------------------------------------------------------------------------
// F. Allowlist rejection — before any D1 query
// ---------------------------------------------------------------------------

test("F: non-allowlisted tables are rejected before any D1 query executes", async () => {
  const forbidden = [
    "users",
    "refresh_tokens",
    "password_reset_tokens",
    "contact_inquiries",
    "demo_requests",
    "newsletter_subscribers",
    "subscriptions",
  ];

  for (const table of forbidden) {
    const { db, calls } = makeMockDb([]);
    await assert.rejects(
      () => fetchSingleRecord(db, table, "some-id"),
      (err: unknown) => err instanceof Error && /not in allowlist/i.test(err.message),
      `${table} must be rejected by the allowlist`,
    );
    assert.equal(calls.length, 0, `no D1 query may run for ${table}`);
    assert.equal(isRagAllowedTable(table), false, `${table} must not be allowed`);
  }

  for (const table of RAG_ALLOWED_TABLES) {
    assert.equal(isRagAllowedTable(table), true, `${table} must be allowed`);
  }

  // The indexer silently drops non-allowlisted table names and never queries them.
  const { db, calls } = makeMockDb([]);
  const env = asEnv({ DB: db, AI: makeMockAi(0), VECTORIZE: makeMockVectorize() });
  await indexApprovedTables(env, { tables: ["faqs", "users"], skipUnchanged: false });
  const queried = new Set(calls.map((c) => c.table));
  assert.ok(!queried.has("users"), "must never query a non-allowlisted table");
});

// ---------------------------------------------------------------------------
// G. Safe deletion helpers (mocks only — never production)
// ---------------------------------------------------------------------------

test("G: deletion helpers validate the allowlist and deterministic ids (mocked Vectorize only)", async () => {
  // G.1 listSourceVectorIds — deterministic + allowlist-protected.
  assert.deepEqual(listSourceVectorIds("faqs", "faq-1", 3), [
    "faqs:faq-1:0",
    "faqs:faq-1:1",
    "faqs:faq-1:2",
  ]);
  assert.throws(() => listSourceVectorIds("users", "u1", 1), /not in RAG allowlist/i);
  assert.throws(() => listSourceVectorIds("faqs", "faq-1", -1), /non-negative integer/i);

  // G.2 deleteStaleVectors — only allowlisted, well-formed ids reach Vectorize.
  const v1 = makeMockVectorize();
  v1.store.set("faqs:faq-1:0", { values: fakeEmbedding(0), metadata: { source_table: "faqs" } });
  v1.store.set("faqs:faq-1:1", { values: fakeEmbedding(0), metadata: { source_table: "faqs" } });
  const env1 = asEnv({ VECTORIZE: v1, CHATBOT_VECTORIZE_KEY: "CHATBOT_VECTORS" });

  const deleted = await deleteStaleVectors(env1, [
    "faqs:faq-1:0",
    "faqs:faq-1:1",
    "users:u1:0",
    "malformed-id",
  ]);
  assert.deepEqual(deleted.sort(), ["faqs:faq-1:0", "faqs:faq-1:1"]);
  assert.equal(v1.deleteCalls, 1, "deleteByIds called exactly once");
  assert.equal(v1.store.size, 0, "both valid vectors removed");

  const none = await deleteStaleVectors(env1, ["users:u1:0", "garbage"]);
  assert.equal(none.length, 0, "no valid ids -> no deletion");
  assert.equal(v1.deleteCalls, 1, "deleteByIds must not run for an all-invalid list");

  // G.3 deleteSourceVectors — removes every chunk for a source, still allowlist-guarded.
  const v2 = makeMockVectorize();
  for (let i = 0; i < 3; i++) {
    v2.store.set(buildVectorId("faqs", "faq-1", i), {
      values: fakeEmbedding(0),
      metadata: { source_table: "faqs", source_id: "faq-1", chunk_index: i },
    });
  }
  const env2 = asEnv({ VECTORIZE: v2, CHATBOT_VECTORIZE_KEY: "CHATBOT_VECTORS" });
  const result = await deleteSourceVectors(env2, "faqs", "faq-1", 3);
  assert.equal(result.deleted.length, 3, "all 3 chunks deleted");
  assert.equal(v2.store.size, 0, "all 3 vectors removed");
  assert.equal(v2.deleteCalls, 1, "deleteByIds called once");

  await assert.rejects(
    () => deleteSourceVectors(env2, "users", "u1", 1),
    /not in RAG allowlist/i,
    "deleteSourceVectors must reject non-allowlisted tables",
  );
});
