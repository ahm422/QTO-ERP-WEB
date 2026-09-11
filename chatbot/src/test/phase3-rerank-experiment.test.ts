import test from "node:test";
import assert from "node:assert/strict";

import { buildConfig } from "../config/index.ts";
import { EVALUATION_CASES } from "../evaluation/dataset.ts";
import {
  EXPERIMENT_CONFIGS,
  createExperimentConfig,
  selectForTopN,
  evaluatePoolAtTopN,
  runRerankExperiment,
  type CaseRetrievalPool,
  type RerankedCandidateRef,
} from "../evaluation/rerank-experiment.ts";
import { faqFixture, makeMockEnv } from "./phase2-mocks.ts";
import type { EvaluationCase } from "../evaluation/types.ts";

function ref(table: string, chunkId: string, rerankScore: number, vectorizeScore = 0.5): RerankedCandidateRef {
  return { table, chunkId, rerankScore, vectorizeScore };
}

function pool(
  ranked: RerankedCandidateRef[],
  vectorizeTables: string[],
  resolvedFreshTables: string[],
): CaseRetrievalPool {
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

test("experiment: baseline config is rerankTopN=5 and candidates are 8 and 10", () => {
  assert.equal(EXPERIMENT_CONFIGS[0].name, "topN=5");
  assert.equal(EXPERIMENT_CONFIGS[0].rerankTopN, 5);
  assert.deepEqual(EXPERIMENT_CONFIGS.map((c) => c.rerankTopN), [5, 8, 10]);
});

test("experiment: thresholds remain at production defaults and are never part of the variation", () => {
  const base = buildConfig();
  assert.equal(base.minRerankScore, 0.05);
  assert.equal(base.minVectorizeScore, 0.15);
  const clone = createExperimentConfig(base, 8);
  assert.equal(clone.rerankTopN, 8);
  assert.equal(clone.minRerankScore, base.minRerankScore);
  assert.equal(clone.minVectorizeScore, base.minVectorizeScore);
  // The base config must not be mutated.
  assert.equal(base.rerankTopN, 8);
});

test("experiment: selection candidate count changes correctly with topN", () => {
  const p = pool(
    [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3].map((s, i) => ref(`faqs:f${i}`, `faq_${i}`, s)),
    ["faqs"],
    ["faqs"],
  );
  assert.equal(selectForTopN(p, 0.1, 5).length, 5);
  assert.equal(selectForTopN(p, 0.1, 8).length, 7);
  assert.equal(selectForTopN(p, 0.1, 10).length, 7);
});

test("experiment: a cutoff failure becomes a pass when the candidate moves into the larger cutoff", () => {
  const ranked = [
    ref("faqs:a", "a", 0.9),
    ref("faqs:b", "b", 0.8),
    ref("faqs:c", "c", 0.7),
    ref("faqs:d", "d", 0.6),
    ref("faqs:e", "e", 0.5),
    ref("faqs:f", "f", 0.45),
    ref("erp_modules", "module_overview_0", 0.4), // expected, rank 7
  ];
  const p = pool(ranked, ["faqs", "erp_modules"], ["faqs", "erp_modules"]);
  const at5 = evaluatePoolAtTopN(caseWith(["erp_modules"]), p, 0.1, { name: "topN=5", rerankTopN: 5 });
  const at8 = evaluatePoolAtTopN(caseWith(["erp_modules"]), p, 0.1, { name: "topN=8", rerankTopN: 8 });
  const at10 = evaluatePoolAtTopN(caseWith(["erp_modules"]), p, 0.1, { name: "topN=10", rerankTopN: 10 });
  assert.equal(at5.retrievalPass, false);
  assert.equal(at5.stage, "rerank-cutoff");
  assert.equal(at8.retrievalPass, true);
  assert.equal(at10.retrievalPass, true);
});

test("experiment: a Vectorize miss stays a miss regardless of rerankTopN", () => {
  const p = pool([ref("faqs:a", "a", 0.9)], ["faqs"], ["faqs"]);
  for (const config of EXPERIMENT_CONFIGS) {
    const outcome = evaluatePoolAtTopN(caseWith(["blog_posts"]), p, 0.1, config);
    assert.equal(outcome.retrievalPass, false);
    assert.equal(outcome.stage, "vectorize");
  }
});

test("experiment: a score-threshold failure is NOT misclassified as a cutoff failure", () => {
  const ranked = [
    ref("faqs:a", "a", 0.05, 0.9), // higher vectorize similarity -> fallback winner
    ref("erp_modules", "module_overview_0", 0.04, 0.5), // expected, below threshold
  ];
  const p = pool(ranked, ["faqs", "erp_modules"], ["faqs", "erp_modules"]);
  for (const config of EXPERIMENT_CONFIGS) {
    const outcome = evaluatePoolAtTopN(caseWith(["erp_modules"]), p, 0.1, config);
    assert.equal(outcome.retrievalPass, false);
    assert.equal(outcome.stage, "rerank-score-threshold");
  }
});

test("experiment: resolution failure is reported as resolution, not rerank", () => {
  const p = pool([], ["pricing_plans"], []);
  const outcome = evaluatePoolAtTopN(caseWith(["pricing_plans"]), p, 0.1, {
    name: "topN=10",
    rerankTopN: 10,
  });
  assert.equal(outcome.retrievalPass, false);
  assert.equal(outcome.stage, "resolution");
});

test("experiment: fallback selects highest Vectorize similarity, never all-zero", () => {
  const withScores = pool(
    [ref("faqs:a", "a", 0, 0.2), ref("faqs:b", "b", 0, 0.7)],
    ["faqs"],
    ["faqs"],
  );
  assert.deepEqual(selectForTopN(withScores, 0.1, 5).map((c) => c.chunkId), ["b"]);

  const zeroScores = pool([ref("faqs:a", "a", 0, 0), ref("faqs:b", "b", 0, 0)], ["faqs"], ["faqs"]);
  assert.deepEqual(selectForTopN(zeroScores, 0.1, 5), []);
});

test("experiment: run never calls Qwen and does not mutate production config", async () => {
  const fixture = await faqFixture();
  const { env, aiCalls } = makeMockEnv({
    matches: [fixture.match],
    rows: { faqs: [fixture.row] },
    rerankScores: [0.7],
  });
  const base = buildConfig();
  const run = await runRerankExperiment([EVALUATION_CASES.find((c) => c.id === "faq-1")!], env, base);

  assert.equal(aiCalls.some((c) => c.model.includes("qwen")), false, "Qwen must never be called");
  assert.equal(base.rerankTopN, 8, "base config must be unchanged");
  assert.equal(run.configs.length, 3);
  assert.equal(run.cases.length, 1);
});

test("experiment: non-retrieval cases are never executed", async () => {
  let aiCalled = false;
  const env = {
    AI: { run: async () => { aiCalled = true; return {}; } },
  } as any;
  const run = await runRerankExperiment([EVALUATION_CASES.find((c) => c.id === "sec-1")!], env, buildConfig());
  assert.equal(aiCalled, false);
  assert.equal(run.cases.length, 0);
});
