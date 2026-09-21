import test from "node:test";
import assert from "node:assert/strict";

import { buildConfig } from "../config/index.ts";
import { mapMatchToCandidate } from "../rag/retriever.ts";
import { rerankCandidates } from "../rag/reranker.ts";
import { RAG_ALLOWED_TABLES } from "../types/allowlist.ts";
import { makeMatch, makeMockEnv } from "./phase2-mocks.ts";

/** Build a validated candidate: allowlisted, resolved, with real text. */
function item(id: string, text: string, vectorizeScore = 0.9) {
  return { ...mapMatchToCandidate(makeMatch({ id, score: vectorizeScore }))!, text };
}

const CFG = buildConfig({ CHATBOT_MIN_RERANK_SCORE: "0.1", CHATBOT_RERANK_TOP_N: "5" });

// 1. Above-threshold reranker behavior is unchanged.
test("reranker: candidates above the floor are ranked and topN-limited", async () => {
  const { env } = makeMockEnv({ rerankScores: [0.9, 0.2, 0.05] });
  const ranked = await rerankCandidates(env, "q", [item("faqs:a:0", "a"), item("faqs:b:0", "b"), item("faqs:c:0", "c")], CFG);
  assert.deepEqual(ranked.map((r) => r.vectorId), ["faqs:a:0", "faqs:b:0"]);
});

test("reranker: candidate text is passed to the model as contexts", async () => {
  const { env, aiCalls } = makeMockEnv({ rerankScores: [0.5] });
  await rerankCandidates(env, "modules?", [item("erp_modules:p:0", "Attendance module overview")], CFG);
  const call = aiCalls.find((c) => c.model.includes("reranker"))!;
  assert.equal(call.opts.query, "modules?");
  assert.deepEqual(call.opts.contexts, [{ text: "Attendance module overview" }]);
});

// 2. High Vectorize / low rerank fallback: noisy reranker (below floor) but clear Vectorize signal.
test("reranker: below-floor fallback selects the highest Vectorize similarity, not ranked[0]", async () => {
  const items = [
    item("erp_modules:erp1:0", "Ticketing System highlights", 0.5007), // higher rerank (noise)
    item("solutions:sol1:0", "HR teams solution overview", 0.6052), // highest similarity
    item("faqs:faq9:0", "Unrelated FAQ", 0.551),
  ];
  // Reranker ranks the unrelated ERP chunk slightly higher (near-zero noise).
  const { env } = makeMockEnv({ rerankScores: [0.0018, 0.0009, 0.001] });
  const ranked = await rerankCandidates(env, "What solutions does QTO ERP offer?", items, CFG);

  assert.equal(ranked.length, 1, "exactly one bounded fallback candidate");
  assert.equal(ranked[0].vectorId, "solutions:sol1:0", "must pick highest Vectorize similarity");
  assert.equal(ranked[0].score, 0.6052);
});

test("reranker: fallback retains the candidate's real, allowlisted source text unchanged", async () => {
  const { env } = makeMockEnv({ rerankScores: [0.0, 0.0] });
  const items = [item("faqs:a:0", "text A", 0.2), item("erp_modules:p:0", "module text", 0.7)];
  const ranked = await rerankCandidates(env, "q", items, CFG);
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].text, "module text");
  assert.ok(RAG_ALLOWED_TABLES.includes(ranked[0].sourceTable));
});

// 3. All-zero Vectorize scores => no context.
test("reranker: all-zero Vectorize scores produce no fallback context", async () => {
  const { env } = makeMockEnv({ rerankScores: [0.05, 0.01, 0.0] });
  const ranked = await rerankCandidates(env, "q", [item("faqs:a:0", "a", 0), item("faqs:b:0", "b", 0)], CFG);
  assert.deepEqual(ranked, []);
});

// 4. Multiple positive similarities => exactly one highest-similarity candidate.
test("reranker: multiple positive similarities retain exactly the single highest", async () => {
  const { env } = makeMockEnv({ rerankScores: [0.04, 0.03, 0.02] });
  const ranked = await rerankCandidates(
    env,
    "q",
    [item("faqs:a:0", "a", 0.3), item("faqs:b:0", "b", 0.8), item("faqs:c:0", "c", 0.5)],
    CFG,
  );
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].vectorId, "faqs:b:0");
});

// 5. Bounded fallback never returns more than one candidate.
test("reranker: bounded fallback never returns more than one candidate", async () => {
  const { env } = makeMockEnv({ rerankScores: [0.01, 0.009, 0.008, 0.007] });
  const items = [0.1, 0.2, 0.3, 0.4].map((s, i) => item(`faqs:f${i}:0`, `t${i}`, s));
  const ranked = await rerankCandidates(env, "q", items, CFG);
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].vectorId, "faqs:f3:0");
});

test("reranker: all-zero rerank scores with positive similarity still yield one grounded fallback", async () => {
  const { env } = makeMockEnv({ rerankScores: [0, 0] });
  const ranked = await rerankCandidates(env, "q", [item("faqs:a:0", "a", 0.4), item("faqs:b:0", "b", 0.6)], CFG);
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].vectorId, "faqs:b:0");
});

test("reranker: diagnostic — representative queries behave as expected", async () => {
  const cases: Array<{ q: string; scores: number[]; vec: number[]; expectCount: number }> = [
    { q: "What pricing plans are available?", scores: [0.05, 0.03], vec: [0.6, 0.5], expectCount: 1 },
    { q: "What modules does QTO ERP provide?", scores: [0.62, 0.11], vec: [0.6, 0.5], expectCount: 2 },
    { q: "What is QTO ERP?", scores: [0.91, 0.4, 0.05], vec: [0.6, 0.5, 0.4], expectCount: 2 },
  ];
  for (const c of cases) {
    const { env } = makeMockEnv({ rerankScores: c.scores });
    const items = c.vec.map((s, i) => item(`faqs:s${i}:0`, `text ${i}`, s));
    const ranked = await rerankCandidates(env, c.q, items, CFG);
    assert.equal(ranked.length, c.expectCount, `${c.q}`);
  }
});

test("reranker: empty input returns [] without calling AI", async () => {
  const { env, aiCalls } = makeMockEnv();
  assert.deepEqual(await rerankCandidates(env, "q", []), []);
  assert.equal(aiCalls.length, 0);
});
