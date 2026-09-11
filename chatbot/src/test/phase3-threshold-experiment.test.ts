import test from "node:test";
import assert from "node:assert/strict";

import { buildConfig } from "../config/index.ts";
import { EVALUATION_CASES } from "../evaluation/dataset.ts";
import {
  THRESHOLD_CONFIGS,
  FIXED_RERANK_TOPN,
  createThresholdConfig,
  evaluatePoolAtThreshold,
  runThresholdExperiment,
} from "../evaluation/threshold-experiment.ts";
import type { CaseRetrievalPool, RerankedCandidateRef } from "../evaluation/rerank-experiment.ts";
import { faqFixture, makeMockEnv } from "./phase2-mocks.ts";
import type { EvaluationCase } from "../evaluation/types.ts";

function ref(table: string, chunkId: string, rerankScore: number, vectorizeScore = 0.5): RerankedCandidateRef {
  return { table, chunkId, rerankScore, vectorizeScore };
}
function pool(ranked: RerankedCandidateRef[], vectorizeTables: string[], resolvedFreshTables: string[]): CaseRetrievalPool {
  return { ranked, vectorizeTables, resolvedFreshTables };
}
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

test("thresholds: baseline 0.10 and evaluation-only 0.05/0.01", () => {
  assert.deepEqual([...THRESHOLD_CONFIGS], [0.1, 0.05, 0.01]);
});

test("threshold config: fixes rerankTopN=8, keeps topK=15 and minVectorizeScore=0.15, never mutates base", () => {
  const base = buildConfig();
  assert.equal(base.ragTopK, 15);
  assert.equal(base.minVectorizeScore, 0.15);

  const candidate = createThresholdConfig(base, 0.05);
  assert.equal(candidate.minRerankScore, 0.05);
  assert.equal(candidate.rerankTopN, FIXED_RERANK_TOPN);
  assert.equal(candidate.ragTopK, 15);
  assert.equal(candidate.minVectorizeScore, 0.15);

  assert.equal(base.minRerankScore, 0.05, "base minRerankScore must be unchanged");
  assert.equal(base.rerankTopN, 8, "base rerankTopN must be unchanged");
});

test("threshold: a score-threshold failure becomes a pass only when the score crosses the threshold", () => {
  const p = pool(
    [ref("erp_modules", "module_overview_0", 0.07, 0.5), ref("faqs", "faq_0", 0.03, 0.9)],
    ["erp_modules", "faqs"],
    ["erp_modules", "faqs"],
  );
  const at10 = evaluatePoolAtThreshold(caseWith(["erp_modules"]), p, 0.1);
  const at05 = evaluatePoolAtThreshold(caseWith(["erp_modules"]), p, 0.05);
  const at01 = evaluatePoolAtThreshold(caseWith(["erp_modules"]), p, 0.01);

  assert.equal(at10.retrievalPass, false);
  assert.equal(at10.stage, "rerank-score-threshold");
  assert.equal(at05.retrievalPass, true, "0.07 crosses the 0.05 threshold");
  assert.equal(at01.retrievalPass, true);
});

test("threshold: Vectorize miss remains independent of the reranker threshold", () => {
  const p = pool([ref("faqs", "faq_0", 0.9)], ["faqs"], ["faqs"]);
  for (const threshold of THRESHOLD_CONFIGS) {
    const outcome = evaluatePoolAtThreshold(caseWith(["blog_posts"]), p, threshold);
    assert.equal(outcome.retrievalPass, false);
    assert.equal(outcome.stage, "vectorize");
  }
});

test("threshold: lower thresholds can admit extra (non-expected) tables", () => {
  const p = pool(
    [ref("erp_modules", "module_overview_0", 0.07, 0.5), ref("faqs", "faq_0", 0.03, 0.9)],
    ["erp_modules", "faqs"],
    ["erp_modules", "faqs"],
  );
  const at10 = evaluatePoolAtThreshold(caseWith(["erp_modules"]), p, 0.1);
  const at01 = evaluatePoolAtThreshold(caseWith(["erp_modules"]), p, 0.01);

  assert.equal(at10.finalCount, 1);
  assert.equal(at01.finalCount, 2);
  assert.equal(at01.contamination, 1, "faqs is an extra non-expected table at 0.01");
});

test("threshold experiment: never calls Qwen and does not mutate production config", async () => {
  const fixture = await faqFixture();
  const { env, aiCalls } = makeMockEnv({
    matches: [fixture.match],
    rows: { faqs: [fixture.row] },
    rerankScores: [0.7],
  });
  const base = buildConfig();
  const run = await runThresholdExperiment([EVALUATION_CASES.find((c) => c.id === "faq-1")!], env, base);

  assert.equal(aiCalls.some((c) => c.model.includes("qwen")), false, "Qwen must never be called");
  assert.equal(base.minRerankScore, 0.05);
  assert.equal(base.rerankTopN, 8);
  assert.equal(run.summaries.length, 3);
});

test("threshold experiment: non-retrieval cases are never executed", async () => {
  let called = false;
  const env = { AI: { run: async () => { called = true; return {}; } } } as any;
  const run = await runThresholdExperiment([EVALUATION_CASES.find((c) => c.id === "sec-1")!], env, buildConfig());
  assert.equal(called, false);
  assert.equal(run.cases.length, 0);
});
