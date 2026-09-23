import test from "node:test";
import assert from "node:assert/strict";

import {
  extractGeneratedText,
  generateAnswer,
  enforceMaxTokens,
  isUsableAnswer,
} from "../rag/generator.ts";
import { UNANSWERED_MESSAGE } from "../config/index.ts";
import { makeMockEnv } from "./phase2-mocks.ts";

const SOURCES = [
  {
    text: "QTO ERP is an all-in-one business management platform.",
    sourceTable: "faqs",
    sourceId: "faq-1",
    chunkId: "faq_0",
    documentType: "faq",
  },
];

test("generation: normal string response is returned", async () => {
  const { env } = makeMockEnv({ llmResponse: { response: "Grounded answer." } });
  assert.equal(await generateAnswer(env, "What is QTO ERP?", SOURCES), "Grounded answer.");
});

test("generation: choices[0].message.content response is returned", async () => {
  const { env } = makeMockEnv({
    llmResponse: { choices: [{ message: { content: "From choices." } }] },
  });
  assert.equal(await generateAnswer(env, "What is QTO ERP?", SOURCES), "From choices.");
});

test("generation: null response + null content yields safe unanswered, not an error", async () => {
  const { env } = makeMockEnv({
    llmResponse: { response: null, choices: [{ message: { content: null, reasoning_content: "secret thinking" } }] },
  });
  assert.equal(await generateAnswer(env, "What is QTO ERP?", SOURCES), UNANSWERED_MESSAGE);
});

test("generation: null content yields safe unanswered", async () => {
  const { env } = makeMockEnv({ llmResponse: { choices: [{ message: { content: null } }] } });
  assert.equal(await generateAnswer(env, "q", SOURCES), UNANSWERED_MESSAGE);
});

test("generation: empty content yields safe unanswered", async () => {
  const { env } = makeMockEnv({ llmResponse: { response: "" } });
  assert.equal(await generateAnswer(env, "q", SOURCES), UNANSWERED_MESSAGE);
});

test("generation: whitespace-only content yields safe unanswered", async () => {
  const { env } = makeMockEnv({ llmResponse: { response: "   \n\t  " } });
  assert.equal(await generateAnswer(env, "q", SOURCES), UNANSWERED_MESSAGE);
});

test("generation: reasoning traces are never surfaced as the answer", () => {
  const response = { choices: [{ message: { content: null, reasoning_content: "internal reasoning" } }] };
  assert.equal(extractGeneratedText(response), "");
  assert.equal(isUsableAnswer("  "), false);
});

test("generation: no sources returns unanswered without calling AI", async () => {
  const { env, aiCalls } = makeMockEnv();
  assert.equal(await generateAnswer(env, "q", []), UNANSWERED_MESSAGE);
  assert.equal(aiCalls.length, 0);
});

test("generation: response exceeding the token cap is truncated", () => {
  const result = enforceMaxTokens("token ".repeat(1000), 500);
  assert.equal(result.truncated, true);
  assert.ok(result.text.length <= 500 * 4 + 2);
});
