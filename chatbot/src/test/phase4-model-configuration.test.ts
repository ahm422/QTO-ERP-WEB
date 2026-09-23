import test from "node:test";
import assert from "node:assert/strict";

import { buildConfig } from "../config/index.ts";
import { embedTexts } from "../rag/embedding.ts";
import { rerankCandidates } from "../rag/reranker.ts";
import { generateAnswer } from "../rag/generator.ts";
import { mapMatchToCandidate } from "../rag/retriever.ts";
import { makeMatch, makeMockEnv } from "./phase2-mocks.ts";

test("model config: centralized model IDs resolve to production values", () => {
  const config = buildConfig();
  assert.equal(config.embeddingModel, "@cf/baai/bge-m3");
  assert.equal(config.rerankerModel, "@cf/baai/bge-reranker-base");
  assert.equal(config.llmModel, "@cf/qwen/qwen3-30b-a3b-fp8");
});

test("model config: RAG defaults remain 15 / 8 / 0.05 / 0.15", () => {
  const config = buildConfig();
  assert.equal(config.ragTopK, 15);
  assert.equal(config.rerankTopN, 8);
  assert.equal(config.minRerankScore, 0.05);
  assert.equal(config.minVectorizeScore, 0.15);
});

test("model config: env vars override model IDs (existing mechanism)", () => {
  const config = buildConfig({
    CHATBOT_EMBEDDING_MODEL: "custom/embed",
    CHATBOT_RERANKER_MODEL: "custom/rerank",
    CHATBOT_LLM_MODEL: "custom/llm",
  });
  assert.equal(config.embeddingModel, "custom/embed");
  assert.equal(config.rerankerModel, "custom/rerank");
  assert.equal(config.llmModel, "custom/llm");
});

test("embedding: uses the configured embedding model (no hard-coded model ID)", async () => {
  const calls: string[] = [];
  const ai = {
    async run(model: string, opts: any) {
      calls.push(model);
      return { data: (opts.text as string[]).map(() => new Array(1024).fill(0.1)) };
    },
  };

  await embedTexts({ AI: ai } as any, ["hello"]);
  assert.equal(calls[0], "@cf/baai/bge-m3");

  await embedTexts({ AI: ai } as any, ["hello"], { model: "explicit/override" });
  assert.equal(calls[1], "explicit/override");

  await embedTexts({ AI: ai, CHATBOT_EMBEDDING_MODEL: "env/override" } as any, ["hello"]);
  assert.equal(calls[2], "env/override");
});

test("reranker: uses the configured reranker model", async () => {
  const { env, aiCalls } = makeMockEnv({ rerankScores: [0.9] });
  const item = { ...mapMatchToCandidate(makeMatch({ id: "faqs:a:0" }))!, text: "a" };
  await rerankCandidates(env, "q", [item]);
  const call = aiCalls.find((c) => c.model.includes("reranker"))!;
  assert.equal(call.model, "@cf/baai/bge-reranker-base");
});

test("generation: uses the configured LLM model", async () => {
  const { env, aiCalls } = makeMockEnv({ llmResponse: { response: "ok" } });
  await generateAnswer(env, "q", [
    { text: "ctx", sourceTable: "faqs", sourceId: "faq-1", chunkId: "faq_0", documentType: "faq" },
  ]);
  const call = aiCalls.find((c) => c.model.includes("qwen"))!;
  assert.equal(call.model, "@cf/qwen/qwen3-30b-a3b-fp8");
});
