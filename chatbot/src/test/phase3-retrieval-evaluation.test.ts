import test from "node:test";
import assert from "node:assert/strict";

import { buildConfig } from "../config/index.ts";
import { EVALUATION_CASES } from "../evaluation/dataset.ts";
import {
  evaluateRetrievalCase,
  runRetrievalEvaluation,
  summarizeRetrieval,
  type RetrievalEvidence,
} from "../evaluation/retrieval.ts";
import {
  createReadOnlyCloudflareEnv,
  createRetrievalRuntime,
  createSafetyCounters,
} from "../evaluation/production-runtime.ts";
import { faqFixture, makeMockEnv } from "./phase2-mocks.ts";
import type { EvaluationCase } from "../evaluation/types.ts";

const CONFIG = buildConfig();

function caseWith(expectedTables: string[]): EvaluationCase {
  return {
    id: "t",
    category: "modules",
    question: "What modules does QTO ERP provide?",
    expectedClassification: "company",
    expectedTables,
    expectRetrieval: true,
    expectAnswer: true,
    securityExpectation: "none",
  };
}

function evidence(partial: Partial<RetrievalEvidence>): RetrievalEvidence {
  return { topK: 15, candidates: [], resolved: [], reranked: [], ...partial };
}

test("retrieval: expected table survives reranking -> PASS", () => {
  const result = evaluateRetrievalCase(
    caseWith(["erp_modules"]),
    evidence({
      candidates: [{ vectorId: "erp_modules:x:0", score: 0.6, table: "erp_modules", chunkId: "module_overview_0" }],
      resolved: [{ table: "erp_modules", chunkId: "module_overview_0", missing: false, stale: false }],
      reranked: [{ table: "erp_modules", chunkId: "module_overview_0", rerankScore: 0.8 }],
    }),
    CONFIG,
  );
  assert.equal(result.metrics.retrievalPass, true);
  assert.equal(result.metrics.vectorizeTableHit, true);
  assert.equal(result.metrics.resolvedTableHit, true);
  assert.equal(result.metrics.rerankerTableHit, true);
});

test("retrieval: expected table absent from Vectorize top-K -> FAIL", () => {
  const result = evaluateRetrievalCase(
    caseWith(["industry_domains"]),
    evidence({
      candidates: [{ vectorId: "faqs:x:0", score: 0.5, table: "faqs", chunkId: "faq_0" }],
      resolved: [{ table: "faqs", chunkId: "faq_0", missing: false, stale: false }],
      reranked: [{ table: "faqs", chunkId: "faq_0", rerankScore: 0.7 }],
    }),
    CONFIG,
  );
  assert.equal(result.metrics.retrievalPass, false);
  assert.equal(result.metrics.vectorizeTableHit, false);
  assert.match(result.metrics.failureReason ?? "", /absent from Vectorize top-K/);
});

test("retrieval: Vectorize hit but D1 resolution miss -> FAIL at resolution", () => {
  const result = evaluateRetrievalCase(
    caseWith(["pricing_plans"]),
    evidence({
      candidates: [{ vectorId: "pricing_plans:p:0", score: 0.6, table: "pricing_plans", chunkId: "pricing_plan_0" }],
      resolved: [{ table: "pricing_plans", chunkId: "pricing_plan_0", missing: true, stale: false }],
      reranked: [],
    }),
    CONFIG,
  );
  assert.equal(result.metrics.retrievalPass, false);
  assert.equal(result.metrics.vectorizeTableHit, true);
  assert.equal(result.metrics.resolvedTableHit, false);
  assert.match(result.metrics.failureReason ?? "", /dropped during D1 resolution/);
});

test("retrieval: reranker removes the expected table -> FAIL at rerank", () => {
  const result = evaluateRetrievalCase(
    caseWith(["pricing_plans"]),
    evidence({
      candidates: [{ vectorId: "pricing_plans:p:0", score: 0.6, table: "pricing_plans", chunkId: "pricing_plan_0" }],
      resolved: [{ table: "pricing_plans", chunkId: "pricing_plan_0", missing: false, stale: false }],
      reranked: [{ table: "erp_modules", chunkId: "module_overview_0", rerankScore: 0.9 }],
    }),
    CONFIG,
  );
  assert.equal(result.metrics.retrievalPass, false);
  assert.equal(result.metrics.vectorizeTableHit, true);
  assert.equal(result.metrics.resolvedTableHit, true);
  assert.equal(result.metrics.rerankerTableHit, false);
  assert.match(result.metrics.failureReason ?? "", /removed by reranking/);
});

test("retrieval: case with no expected tables passes trivially", () => {
  const result = evaluateRetrievalCase(caseWith([]), evidence({}), CONFIG);
  assert.equal(result.metrics.retrievalPass, true);
});

test("retrieval runner: non-retrieval cases are skipped and never call the runtime", async () => {
  let called = false;
  const runtime = {
    async collect() {
      called = true;
      throw new Error("runtime must not be called");
    },
  };
  const securityCase = EVALUATION_CASES.find((c) => c.id === "sec-1")!;
  const run = await runRetrievalEvaluation([securityCase], runtime, CONFIG);
  assert.equal(called, false);
  assert.deepEqual(run.results, []);
  assert.deepEqual(run.skipped, ["sec-1"]);
});

test("summarizeRetrieval: aggregates hit rate and failure stages", () => {
  const results = [
    evaluateRetrievalCase(
      caseWith(["faqs"]),
      evidence({
        candidates: [{ vectorId: "faqs:a:0", score: 0.5, table: "faqs", chunkId: "faq_0" }],
        resolved: [{ table: "faqs", chunkId: "faq_0", missing: false, stale: false }],
        reranked: [{ table: "faqs", chunkId: "faq_0", rerankScore: 0.8 }],
      }),
      CONFIG,
    ),
    evaluateRetrievalCase(
      caseWith(["erp_modules"]),
      evidence({ candidates: [], resolved: [], reranked: [] }),
      CONFIG,
    ),
  ];
  const summary = summarizeRetrieval(results, ["sec-1"]);
  assert.equal(summary.totalRetrievalCases, 2);
  assert.equal(summary.passed, 1);
  assert.equal(summary.failed, 1);
  assert.equal(summary.skipped, 1);
  assert.equal(summary.absentFromTopK, 1);
  assert.equal(summary.expectedTableHitRate, 0.5);
});

test("production env: read-only guards and safety counters", async () => {
  const calls: string[] = [];
  const fakeFetch = (async (url: any) => {
    const u = String(url);
    calls.push(u);
    let body: any = {};
    if (u.includes("/ai/run/")) {
      body = { success: true, result: { data: [new Array(1024).fill(0.01)], response: [{ id: 0, score: 0.9 }] } };
    } else if (u.includes("/vectorize/")) {
      body = { success: true, result: { matches: [] } };
    } else if (u.includes("/d1/")) {
      body = { success: true, result: [{ results: [] }] };
    }
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  }) as unknown as typeof fetch;

  const counters = createSafetyCounters();
  const { env } = createReadOnlyCloudflareEnv({
    accountId: "acct",
    databaseId: "db",
    indexName: "idx",
    token: "test-token",
    fetchImpl: fakeFetch,
    counters,
  });

  await env.AI!.run("@cf/baai/bge-m3", { text: ["hello"] });
  assert.equal(counters.bgeCalls, 1);

  await assert.rejects(() => env.AI!.run("@cf/qwen/qwen3-30b-a3b-fp8", {}), /Qwen is forbidden/);
  assert.equal(counters.qwenCalls, 1);

  await env.VECTORIZE!.query([0.1], { topK: 1 });
  assert.equal(counters.vectorizeQuery, 1);

  await assert.rejects(() => env.VECTORIZE!.upsert([]), /forbidden/);
  assert.equal(counters.vectorizeMutation, 1);

  assert.throws(() => env.DB!.prepare("DELETE FROM faqs"), /Non-SELECT/);
  assert.equal(counters.d1Write, 1);

  const stmt = env.DB!.prepare("SELECT * FROM faqs WHERE id = ?");
  const result = await stmt.bind("faq-1").all();
  assert.equal(counters.d1Select, 1);
  assert.deepEqual(result.results, []);

  assert.equal(counters.qwenCalls, 1, "Qwen must never be called");
});

test("production runtime: reuses the existing pipeline with a mocked env", async () => {
  const fixture = await faqFixture();
  const { env } = makeMockEnv({
    matches: [fixture.match],
    rows: { faqs: [fixture.row] },
    rerankScores: [0.9],
  });
  const runtime = createRetrievalRuntime(env);
  const testCase: EvaluationCase = {
    id: "rt-1",
    category: "faqs",
    question: "What is QTO ERP?",
    expectedClassification: "company",
    expectedTables: ["faqs"],
    expectRetrieval: true,
    expectAnswer: true,
    securityExpectation: "none",
  };

  const ev = await runtime.collect(testCase, CONFIG);
  assert.equal(ev.candidates.length, 1);
  const result = evaluateRetrievalCase(testCase, ev, CONFIG);
  assert.equal(result.metrics.retrievalPass, true);
  assert.ok(result.metrics.resolvedFreshChunkCount >= 1);
});

test("dataset: all 40 cases remain valid for retrieval evaluation", () => {
  assert.equal(EVALUATION_CASES.length, 40);
  for (const c of EVALUATION_CASES) {
    assert.equal(typeof c.id, "string");
    assert.equal(typeof c.expectRetrieval, "boolean");
    assert.ok(Array.isArray(c.expectedTables));
    if (!c.expectRetrieval) {
      assert.equal(c.expectedTables.length, 0, `${c.id} must not expect tables when retrieval is skipped`);
    }
  }
});
