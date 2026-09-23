/**
 * Phase 4 — dynamic reindex: scheduled/manual indexing, prune of deleted rows,
 * and admin auth for `POST /index`.
 *
 * All bindings are mocked; no production D1/Vectorize/AI is touched.
 * Runner: node --experimental-strip-types --test
 */
import test from "node:test";
import assert from "node:assert/strict";

import worker from "../index.ts";
import { runReindex, planPruneDeletions } from "../rag/reindex.ts";
import { constantTimeEqual, authorizeAdmin, extractAdminToken } from "../chat/admin-auth.ts";
import { buildVectorId } from "../types/core.ts";
import { extractSingleRecord } from "../rag/extractors.ts";
import { chunkDocuments } from "../lib/chunker.ts";
import { BGE_M3_DIMENSION } from "../rag/embedding.ts";
import type { Env } from "../types/env.ts";

const ADMIN_TOKEN = "test-admin-token";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

function fakeEmbedding(n: number): number[] {
  return Array.from({ length: BGE_M3_DIMENSION }, (_, i) => (i === n ? 1 : 0));
}

function makeMockDb(state: { rows: Record<string, Array<Record<string, unknown>>> }) {
  return {
    prepare(sql: string) {
      const table = sql.match(/FROM\s+([a-zA-Z_]+)/i)?.[1] ?? "";
      return {
        all: async () => state.rows[table] ?? [],
      };
    },
  };
}

function makeMockAi() {
  const ai = {
    async run(_model: string, opts: Record<string, unknown>) {
      const texts = Array.isArray(opts?.text) ? (opts.text as string[]) : [];
      return { data: texts.map(() => fakeEmbedding(0)) };
    },
  };
  return ai;
}

function makeMockVectorize() {
  const store = new Map<string, { values: number[]; metadata: Record<string, unknown> }>();
  let deleteCalls = 0;
  return {
    async upsert(vectors: Array<{ id: string; values: number[]; metadata: Record<string, unknown> }>) {
      for (const v of vectors) store.set(v.id, { values: v.values, metadata: v.metadata });
      return { mutationId: "mock" };
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
    get deleteCalls() {
      return deleteCalls;
    },
    store,
  };
}

function makeMockKv() {
  const store = new Map<string, string>();
  return {
    async get(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    async put(key: string, value: string) {
      store.set(key, value);
    },
    store,
  };
}

function asEnv(bundle: Record<string, unknown>): Env {
  return bundle as unknown as Env;
}

interface Harness {
  env: Env;
  state: { rows: Record<string, Array<Record<string, unknown>>> };
  vectorize: ReturnType<typeof makeMockVectorize>;
  kv: ReturnType<typeof makeMockKv> | null;
}

function makeHarness(options: { withKv?: boolean } = {}): Harness {
  const state: Harness["state"] = { rows: {} };
  const vectorize = makeMockVectorize();
  const kv = options.withKv === false ? null : makeMockKv();
  const env = asEnv({
    DB: makeMockDb(state),
    AI: makeMockAi(),
    VECTORIZE: vectorize,
    CHATBOT_VECTORIZE_KEY: "CHATBOT_VECTORS",
    CHATBOT_CHUNK_TARGET_TOKENS: "200",
    CHATBOT_CHUNK_OVERLAP_TOKENS: "30",
    CHATBOT_ADMIN_TOKEN: ADMIN_TOKEN,
    ...(kv ? { CHATBOT_SYNC_STATE: kv } : {}),
  });
  return { env, state, vectorize, kv };
}

const FAQ_ANSWER =
  "The Growth plan starts at $99/month and includes unlimited users and priority support.";

function faqRow(answer = FAQ_ANSWER): Record<string, unknown> {
  return {
    id: "faq-1",
    page_key: "pricing",
    question: "What is the price of the Growth plan?",
    answer,
    published: 1,
    updated_at: "2026-09-10T00:00:00.000Z",
  };
}

async function expectedChunks(row: Record<string, unknown>): Promise<number> {
  const docs = extractSingleRecord("faqs", row);
  const chunks = await chunkDocuments("faqs", "faq-1", docs, "2026-09-10T00:00:00.000Z", "v1", {
    targetTokens: 200,
    overlapTokens: 30,
  });
  return chunks.length;
}

const MANIFEST_KEY = "chatbot:sync-manifest:v1:CHATBOT_VECTORS";

// ---------------------------------------------------------------------------
// Admin auth
// ---------------------------------------------------------------------------

test("auth: constantTimeEqual compares safely", () => {
  assert.equal(constantTimeEqual("abc", "abc"), true);
  assert.equal(constantTimeEqual("abc", "abd"), false);
  assert.equal(constantTimeEqual("abc", "abcd"), false);
  assert.equal(constantTimeEqual("", ""), true);
});

test("auth: extracts token from Bearer and x-chatbot-admin-token", () => {
  const bearer = new Request("https://x/index", { headers: { authorization: "Bearer tok123" } });
  assert.equal(extractAdminToken(bearer), "tok123");

  const header = new Request("https://x/index", { headers: { "x-chatbot-admin-token": "tok456" } });
  assert.equal(extractAdminToken(header), "tok456");
  assert.equal(extractAdminToken(new Request("https://x/index")), "");
});

test("auth: unconfigured -> 503, missing/wrong -> 401, correct -> ok", () => {
  const req = (token?: string) =>
    new Request("https://x/index", token ? { headers: { authorization: `Bearer ${token}` } } : {});

  assert.equal(authorizeAdmin(req("anything"), asEnv({})).status, 503);
  assert.equal(authorizeAdmin(req(), asEnv({ CHATBOT_ADMIN_TOKEN: ADMIN_TOKEN })).status, 401);
  assert.equal(
    authorizeAdmin(req("nope"), asEnv({ CHATBOT_ADMIN_TOKEN: ADMIN_TOKEN })).status,
    401,
  );
  assert.equal(
    authorizeAdmin(req(ADMIN_TOKEN), asEnv({ CHATBOT_ADMIN_TOKEN: ADMIN_TOKEN })).ok,
    true,
  );
});

// ---------------------------------------------------------------------------
// Prune planning
// ---------------------------------------------------------------------------

test("planPruneDeletions: removed source deletes all its chunks", () => {
  const previous = {
    version: 1 as const,
    namespace: "CHATBOT_VECTORS",
    updatedAt: "2026-01-01T00:00:00.000Z",
    sources: { "faqs:faq-1": { chunks: 2 } },
  };
  const ids = planPruneDeletions(previous, {}, new Set(["faqs"]));
  assert.deepEqual(ids, ["faqs:faq-1:0", "faqs:faq-1:1"]);
});

test("planPruneDeletions: shrunken source deletes only the excess chunks", () => {
  const previous = {
    version: 1 as const,
    namespace: "CHATBOT_VECTORS",
    updatedAt: "2026-01-01T00:00:00.000Z",
    sources: { "faqs:faq-1": { chunks: 4 } },
  };
  const ids = planPruneDeletions(previous, { "faqs:faq-1": 2 }, new Set(["faqs"]));
  assert.deepEqual(ids, ["faqs:faq-1:2", "faqs:faq-1:3"]);
});

test("planPruneDeletions: ignores unscanned tables and non-allowlisted keys", () => {
  const previous = {
    version: 1 as const,
    namespace: "CHATBOT_VECTORS",
    updatedAt: "2026-01-01T00:00:00.000Z",
    sources: {
      "faqs:faq-1": { chunks: 3 },
      "erp_modules:mod-1": { chunks: 3 },
      "users:u1": { chunks: 3 },
    },
  };
  const ids = planPruneDeletions(previous, {}, new Set(["erp_modules"]));
  assert.deepEqual(ids, ["erp_modules:mod-1:0", "erp_modules:mod-1:1", "erp_modules:mod-1:2"]);
});

// ---------------------------------------------------------------------------
// Reindex: upsert + manifest
// ---------------------------------------------------------------------------

test("reindex: first run upserts new content and writes the sync manifest", async () => {
  const h = makeHarness();
  h.state.rows.faqs = [faqRow()];
  const n = await expectedChunks(faqRow());

  const result = await runReindex(h.env, { tables: ["faqs"] });

  assert.equal(result.dryRun, false);
  assert.equal(result.pruneSkippedReason, undefined);
  assert.equal(result.vectorsDeleted, 0);
  assert.equal(result.manifestWritten, true);
  for (let i = 0; i < n; i += 1) {
    assert.ok(h.vectorize.store.has(buildVectorId("faqs", "faq-1", i)), `missing chunk ${i}`);
  }

  const manifest = JSON.parse(h.kv!.store.get(MANIFEST_KEY)!);
  assert.equal(manifest.sources["faqs:faq-1"].chunks, n);
});

test("reindex: a deleted D1 row prunes its vectors and drops it from the manifest", async () => {
  const h = makeHarness();
  h.state.rows.faqs = [faqRow()];
  const n = await expectedChunks(faqRow());

  await runReindex(h.env, { tables: ["faqs"] });
  assert.equal(h.vectorize.store.size, n);

  // Row deleted from D1.
  h.state.rows.faqs = [];
  const result = await runReindex(h.env, { tables: ["faqs"] });

  assert.equal(result.vectorsDeleted, n, "all chunks of the deleted row must be pruned");
  assert.equal(h.vectorize.store.size, 0);
  const manifest = JSON.parse(h.kv!.store.get(MANIFEST_KEY)!);
  assert.equal(manifest.sources["faqs:faq-1"], undefined, "deleted source removed from manifest");
});

test("reindex: a shrunken row prunes only the now-excess chunks", async () => {
  const h = makeHarness();
  const row = faqRow();
  const n = await expectedChunks(row);

  // Simulate a previous run that stored 5 chunks for this source.
  for (let i = 0; i < 5; i += 1) {
    h.vectorize.store.set(buildVectorId("faqs", "faq-1", i), {
      values: fakeEmbedding(0),
      metadata: { source_table: "faqs", content_hash: "0".repeat(64) },
    });
  }
  await h.kv!.put(
    MANIFEST_KEY,
    JSON.stringify({
      version: 1,
      namespace: "CHATBOT_VECTORS",
      updatedAt: "2026-01-01T00:00:00.000Z",
      sources: { "faqs:faq-1": { chunks: 5 } },
    }),
  );

  h.state.rows.faqs = [row];
  const result = await runReindex(h.env, { tables: ["faqs"] });

  assert.equal(result.vectorsDeleted, 5 - n, "prune the excess tail chunks");
  assert.equal(h.vectorize.store.size, n);
  for (let i = 0; i < n; i += 1) {
    assert.ok(h.vectorize.store.has(buildVectorId("faqs", "faq-1", i)));
  }
  const manifest = JSON.parse(h.kv!.store.get(MANIFEST_KEY)!);
  assert.equal(manifest.sources["faqs:faq-1"].chunks, n);
});

test("reindex: dry run reports planned deletions but changes nothing", async () => {
  const h = makeHarness();
  // Seed a stale vector + manifest, but D1 is empty.
  h.vectorize.store.set(buildVectorId("faqs", "faq-1", 0), {
    values: fakeEmbedding(0),
    metadata: { source_table: "faqs" },
  });
  const before = JSON.stringify(h.kv!.store.get(MANIFEST_KEY) ?? null);
  await h.kv!.put(
    MANIFEST_KEY,
    JSON.stringify({
      version: 1,
      namespace: "CHATBOT_VECTORS",
      updatedAt: "2026-01-01T00:00:00.000Z",
      sources: { "faqs:faq-1": { chunks: 1 } },
    }),
  );
  const manifestBefore = h.kv!.store.get(MANIFEST_KEY)!;

  h.state.rows.faqs = [];
  const result = await runReindex(h.env, { tables: ["faqs"], dryRun: true });

  assert.equal(result.dryRun, true);
  assert.equal(result.vectorsDeletePlanned, 1);
  assert.equal(result.vectorsDeleted, 1, "dry run reports planned count");
  assert.equal(result.manifestWritten, false);
  assert.equal(h.vectorize.deleteCalls, 0, "dry run must not call deleteByIds");
  assert.ok(h.vectorize.store.has(buildVectorId("faqs", "faq-1", 0)), "vector not removed");
  assert.equal(h.kv!.store.get(MANIFEST_KEY), manifestBefore, "manifest unchanged");
  void before;
});

test("reindex: without KV binding, upserts still run and pruning is skipped", async () => {
  const h = makeHarness({ withKv: false });
  h.state.rows.faqs = [faqRow()];

  const result = await runReindex(h.env, { tables: ["faqs"] });

  assert.equal(h.vectorize.store.size > 0, true, "content was still indexed");
  assert.equal(result.manifestWritten, false);
  assert.match(String(result.pruneSkippedReason), /CHATBOT_SYNC_STATE/);
});

// ---------------------------------------------------------------------------
// POST /index route
// ---------------------------------------------------------------------------

function indexRequest(options: {
  method?: string;
  token?: string | null;
  body?: string;
} = {}): Request {
  const method = options.method ?? "POST";
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  const init: RequestInit = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    init.body = options.body ?? JSON.stringify({ dryRun: true, tables: ["faqs"] });
  }
  return new Request("https://chat.local/index", init);
}

test("POST /index: rejects missing and wrong tokens", async () => {
  const h = makeHarness();
  h.state.rows.faqs = [faqRow()];

  const missing = await worker.fetch(indexRequest({ token: null }), h.env);
  assert.equal(missing.status, 401);
  assert.equal((await missing.json() as any).error, "Unauthorized");

  const wrong = await worker.fetch(indexRequest({ token: "bad" }), h.env);
  assert.equal(wrong.status, 401);
});

test("POST /index: 503 when admin token is not configured", async () => {
  const h = makeHarness();
  const envNoToken = asEnv({ ...(h.env as any), CHATBOT_ADMIN_TOKEN: undefined });
  const res = await worker.fetch(indexRequest({ token: ADMIN_TOKEN }), envNoToken);
  assert.equal(res.status, 503);
});

test("POST /index: runs a dry-run reindex for an authorized caller", async () => {
  const h = makeHarness();
  h.state.rows.faqs = [faqRow()];

  const res = await worker.fetch(indexRequest({ token: ADMIN_TOKEN }), h.env);
  assert.equal(res.status, 200);
  const body = (await res.json()) as any;
  assert.equal(body.dryRun, true);
  assert.equal(body.manifestWritten, false);
  assert.deepEqual(body.tables, ["faqs"]);
});

test("POST /index: validates the request body", async () => {
  const h = makeHarness();
  const bad = await worker.fetch(
    indexRequest({ token: ADMIN_TOKEN, body: JSON.stringify({ tables: 5 }) }),
    h.env,
  );
  assert.equal(bad.status, 400);

  const malformed = await worker.fetch(
    indexRequest({ token: ADMIN_TOKEN, body: "{ not json" }),
    h.env,
  );
  assert.equal(malformed.status, 400);
});

test("POST /index: GET is not allowed", async () => {
  const h = makeHarness();
  const res = await worker.fetch(indexRequest({ method: "GET", token: ADMIN_TOKEN }), h.env);
  assert.equal(res.status, 405);
});

test("scheduled: handler is exported", () => {
  assert.equal(typeof worker.scheduled, "function");
});
