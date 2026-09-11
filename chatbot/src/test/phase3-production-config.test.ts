import test from "node:test";
import assert from "node:assert/strict";

import { buildConfig } from "../config/index.ts";
import { evaluatePoolAtTopN, type CaseRetrievalPool, type RerankedCandidateRef } from "../evaluation/rerank-experiment.ts";
import type { EvaluationCase } from "../evaluation/types.ts";

function ref(table: string, chunkId: string, rerankScore: number, vectorizeScore = 0.5): RerankedCandidateRef {
  return { table, chunkId, rerankScore, vectorizeScore };
}
function pool(ranked: RerankedCandidateRef[], vectorizeTables: string[], resolvedFreshTables: string[]): CaseRetrievalPool {
  return { ranked, vectorizeTables, resolvedFreshTables };
}
function caseWith(id: string, expectedTables: string[]): EvaluationCase {
  return {
    id,
    category: "public-sector",
    question: "q",
    expectedClassification: "company",
    expectedTables,
    expectRetrieval: true,
    expectAnswer: true,
    securityExpectation: "none",
  };
}

test("production config (Step 6): topK=15, rerankTopN=8, minRerankScore=0.05, minVectorizeScore=0.15", () => {
  const config = buildConfig();
  assert.equal(config.ragTopK, 15);
  assert.equal(config.rerankTopN, 8);
  assert.equal(config.minRerankScore, 0.05);
  assert.equal(config.minVectorizeScore, 0.15);
});

test("production config: env vars still override defaults (mechanism unchanged)", () => {
  const overridden = buildConfig({ CHATBOT_RERANK_TOP_N: "5", CHATBOT_MIN_RERANK_SCORE: "0.1" });
  assert.equal(overridden.rerankTopN, 5);
  assert.equal(overridden.minRerankScore, 0.1);
});

test("regression ov-2: about_story now survives the rerankTopN=8 cutoff", () => {
  const p = pool(
    [
      ref("faqs", "a", 0.9),
      ref("faqs", "b", 0.85),
      ref("faqs", "c", 0.8),
      ref("faqs", "d", 0.75),
      ref("faqs", "e", 0.7),
      ref("about_story", "about_story_0", 0.08), // rank 6
    ],
    ["faqs", "about_story"],
    ["faqs", "about_story"],
  );
  const at5 = evaluatePoolAtTopN(caseWith("ov-2", ["about_story"]), p, 0.05, { name: "topN=5", rerankTopN: 5 });
  const at8 = evaluatePoolAtTopN(caseWith("ov-2", ["about_story"]), p, 0.05, { name: "topN=8", rerankTopN: 8 });
  assert.equal(at5.retrievalPass, false);
  assert.equal(at5.stage, "rerank-cutoff");
  assert.equal(at8.retrievalPass, true);
});

test("regression ps-1: solutions/about_story now survives the rerankTopN=8 cutoff", () => {
  const p = pool(
    [
      ref("faqs", "a", 0.9),
      ref("faqs", "b", 0.85),
      ref("faqs", "c", 0.8),
      ref("faqs", "d", 0.75),
      ref("faqs", "e", 0.7),
      ref("faqs", "f", 0.3),
      ref("solutions", "solution_overview_0", 0.07), // rank 7
    ],
    ["faqs", "solutions"],
    ["faqs", "solutions"],
  );
  const at5 = evaluatePoolAtTopN(caseWith("ps-1", ["solutions"]), p, 0.05, { name: "topN=5", rerankTopN: 5 });
  const at8 = evaluatePoolAtTopN(caseWith("ps-1", ["solutions"]), p, 0.05, { name: "topN=8", rerankTopN: 8 });
  assert.equal(at5.retrievalPass, false);
  assert.equal(at5.stage, "rerank-cutoff");
  assert.equal(at8.retrievalPass, true);
});

test("regression sol-3: solutions now survives the minRerankScore=0.05 threshold", () => {
  const p = pool(
    [ref("solutions", "solution_recommended_modules_2", 0.062, 0.6481), ref("faqs", "faq_0", 0.02, 0.9)],
    ["solutions", "faqs"],
    ["solutions", "faqs"],
  );
  const at010 = evaluatePoolAtTopN(caseWith("sol-3", ["solutions"]), p, 0.1, { name: "min=0.10", rerankTopN: 8 });
  const at005 = evaluatePoolAtTopN(caseWith("sol-3", ["solutions"]), p, 0.05, { name: "min=0.05", rerankTopN: 8 });
  assert.equal(at010.retrievalPass, false);
  assert.equal(at010.stage, "rerank-score-threshold");
  assert.equal(at005.retrievalPass, true);
});

test("limitation ps-4: blog_posts remains unresolved (Vectorize miss) under the tuned config", () => {
  const p = pool([ref("faqs", "faq_0", 0.9)], ["faqs"], ["faqs"]);
  const outcome = evaluatePoolAtTopN(caseWith("ps-4", ["blog_posts"]), p, 0.05, { name: "topN=8", rerankTopN: 8 });
  assert.equal(outcome.retrievalPass, false);
  assert.equal(outcome.stage, "vectorize");
});

test("limitation mod-2: erp_modules remains unresolved (score 0.0164 < 0.05)", () => {
  const p = pool(
    [ref("faqs", "faq_0", 0.9, 0.9), ref("erp_modules", "module_overview_0", 0.0164, 0.6621)],
    ["faqs", "erp_modules"],
    ["faqs", "erp_modules"],
  );
  const outcome = evaluatePoolAtTopN(caseWith("mod-2", ["erp_modules"]), p, 0.05, { name: "topN=8", rerankTopN: 8 });
  assert.equal(outcome.retrievalPass, false);
  assert.equal(outcome.stage, "rerank-score-threshold");
});

test("limitation bnd-2: erp_modules remains unresolved (score 0.0034 < 0.05)", () => {
  const p = pool(
    [ref("faqs", "faq_0", 0.9, 0.9), ref("erp_modules", "module_overview_0", 0.0034, 0.607)],
    ["faqs", "erp_modules"],
    ["faqs", "erp_modules"],
  );
  const outcome = evaluatePoolAtTopN(caseWith("bnd-2", ["erp_modules"]), p, 0.05, { name: "topN=8", rerankTopN: 8 });
  assert.equal(outcome.retrievalPass, false);
  assert.equal(outcome.stage, "rerank-score-threshold");
});
