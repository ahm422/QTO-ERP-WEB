import test from "node:test";
import assert from "node:assert/strict";

import { buildConfig } from "../config/index.ts";
import { EVALUATION_CASES } from "../evaluation/dataset.ts";
import {
  TOPK_CONFIGS,
  FIXED_RERANK_TOPN,
  FIXED_MIN_RERANK_SCORE,
  FIXED_MIN_VECTORIZE_SCORE,
  createTopKConfig,
  evaluatePoolAtTopK,
  runTopKExperiment,
} from "../evaluation/topk-experiment.ts";
import type { CaseRetrievalPool, RerankedCandidateRef } from "../evaluation/rerank-experiment.ts";
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
    category: "public-sector",
    question: "Does QTO ERP publish articles?",
    expectedClassification: "company",
    expectedTables,
    expectRetrieval: true,
    expectAnswer: true,
    securityExpectation: "none",
  };
}

test("topK: baseline 15 and evaluation-only 20/30", () => {
  assert.deepEqual([...TOPK_CONFIGS], [15, 20, 30]);
  assert.equal(TOPK_CONFIGS[0], 15);
});

test("topK config: fixes downstream params and never mutates base", () => {
  const base = buildConfig();
  const c20 = createTopKConfig(base, 20);
  assert.equal(c20.ragTopK, 20);
  assert.equal(c20.rerankTopN, FIXED_RERANK_TOPN);
  assert.equal(c20.rerankTopN, 8);
  assert.equal(c20.minRerankScore, FIXED_MIN_RERANK_SCORE);
  assert.equal(c20.minRerankScore, 0.05);
  assert.equal(c20.minVectorizeScore, FIXED_MIN_VECTORIZE_SCORE);
  assert.equal(c20.minVectorizeScore, 0.15);

  assert.equal(base.ragTopK, 15, "base topK unchanged");
  assert.equal(base.rerankTopN, 8, "base rerankTopN unchanged");
  assert.equal(base.minRerankScore, 0.05, "base minRerankScore unchanged");
});

test("topK: increasing topK cannot alter the configured thresholds", () => {
  const base = buildConfig();
  for (const topK of TOPK_CONFIGS) {
    const c = createTopKConfig(base, topK);
    assert.equal(c.rerankTopN, 8);
    assert.equal(c.minRerankScore, 0.05);
    assert.equal(c.minVectorizeScore, 0.15);
  }
});

test("topK: a Vectorize miss can become a hit at a larger topK", () => {
  const noBlog = pool([ref("faqs", "faq_0", 0.9)], ["faqs"], ["faqs"]);
  const withBlog = pool(
    [ref("blog_posts", "blog_0", 0.6, 0.4), ref("faqs", "faq_0", 0.9, 0.5)],
    ["blog_posts", "faqs"],
    ["blog_posts", "faqs"],
  );
  const at15 = evaluatePoolAtTopK(caseWith(["blog_posts"]), noBlog, 15);
  const at30 = evaluatePoolAtTopK(caseWith(["blog_posts"]), withBlog, 30);
  assert.equal(at15.retrievalPass, false);
  assert.equal(at15.stage, "vectorize");
  assert.equal(at30.retrievalPass, true);
});

test("topK: reranker-stage failures remain independent of topK", () => {
  const p = pool(
    [ref("erp_modules", "m", 0.03), ref("faqs", "f", 0.9, 0.9)],
    ["erp_modules", "faqs"],
    ["erp_modules", "faqs"],
  );
  for (const topK of TOPK_CONFIGS) {
    const outcome = evaluatePoolAtTopK(caseWith(["erp_modules"]), p, topK);
    assert.equal(outcome.retrievalPass, false);
    assert.equal(outcome.stage, "rerank-score-threshold");
  }
});

test("topK experiment: never calls Qwen, never mutates, and does not mutate production config", async () => {
  const qwenModels: string[] = [];
  const env = {
    AI: {
      async run(model: string, opts: any) {
        if (model.includes("qwen")) {
          qwenModels.push(model);
          throw new Error("Qwen forbidden");
        }
        if (model.includes("bge-m3")) return { data: opts.text.map(() => new Array(1024).fill(0.01)) };
        if (model.includes("reranker")) return { response: opts.contexts.map((_: unknown, i: number) => ({ id: i, score: 0.9 })) };
        throw new Error("unexpected model");
      },
    },
    VECTORIZE: {
      async query() {
        return { matches: [] };
      },
      async upsert() {
        throw new Error("mutation forbidden");
      },
      async deleteByIds() {
        throw new Error("mutation forbidden");
      },
    },
    DB: {
      prepare() {
        return { bind: () => ({ all: async () => ({ results: [] }) }) };
      },
    },
  } as any;

  const base = buildConfig();
  const run = await runTopKExperiment([EVALUATION_CASES.find((c) => c.id === "ps-4")!], env, base);

  assert.deepEqual(qwenModels, []);
  assert.equal(base.ragTopK, 15);
  assert.equal(base.rerankTopN, 8);
  assert.equal(run.summaries.length, 3);
});

test("topK experiment: non-retrieval cases are never executed", async () => {
  let called = false;
  const env = { AI: { run: async () => { called = true; return {}; } } } as any;
  const run = await runTopKExperiment([EVALUATION_CASES.find((c) => c.id === "sec-1")!], env, buildConfig());
  assert.equal(called, false);
  assert.equal(run.cases.length, 0);
});
