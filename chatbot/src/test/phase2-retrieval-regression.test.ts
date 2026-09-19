/**
 * Phase 2 retrieval regression — highly relevant FAQ results must not be
 * silently discarded by the reranker's top-N cutoff or score floor.
 *
 * Scenario from production:
 *   D1 FAQ `o7lkfg8pbdvo8cj2p5fs042a` ("Can I choose the ERP features my
 *   business needs?") is published and present in Vectorize. Its Vectorize
 *   similarity is the strongest of the candidate set, but the (noisy)
 *   cross-encoder can rank it below the top-N cutoff, dropping it before
 *   generation.
 *
 * All bindings are mocked. No production D1/Vectorize/AI is touched.
 * Runner: node --experimental-strip-types --test
 */
import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";

import { buildConfig } from "../config/index.ts";
import { mapMatchToCandidate } from "../rag/retriever.ts";
import { rerankCandidates, type RerankableCandidate } from "../rag/reranker.ts";
import { handleChat } from "../chat/handler.ts";
import { resetRateLimiter } from "../chat/rate-limit.ts";
import { makeMatch, makeMockEnv, chatRequest } from "./phase2-mocks.ts";

beforeEach(() => {
  resetRateLimiter();
});

const FAQ_ID = "o7lkfg8pbdvo8cj2p5fs042a";
const FAQ_QUESTION = "Can I choose the ERP features my business needs?";
const FAQ_ANSWER =
  "Yes. QTO ERP lets you choose the ERP features your business needs so you can enable only the modules you require.";

const CFG = buildConfig({ CHATBOT_MIN_RERANK_SCORE: "0.05", CHATBOT_RERANK_TOP_N: "8" });

/** Raw, validated Vectorize match for an allowed `faqs` source. */
function matchFor(sid: string, score: number) {
  return makeMatch({
    id: `faqs:${sid}:0`,
    score,
    metadata: {
      source_table: "faqs",
      source_id: sid,
      chunk_id: "faq_0",
      chunk_index: 0,
      document_type: "faq",
    },
  });
}

/** Map a raw match into a rerankable candidate with real text. */
function item(match: unknown): RerankableCandidate {
  return { ...mapMatchToCandidate(match)!, text: "text" };
}

function faqRow(sid: string, question: string, answer: string) {
  return {
    id: sid,
    page_key: "home",
    question,
    answer,
    published: 1,
    updated_at: "2026-09-10T00:00:00.000Z",
  };
}

/**
 * 1 highly-relevant FAQ (strongest Vectorize score) + 9 unrelated FAQs with
 * weak Vectorize scores. Order: FAQ first, then unrelated.
 */
function scenario() {
  const matches = [matchFor(FAQ_ID, 0.82)];
  const rows = [faqRow(FAQ_ID, FAQ_QUESTION, FAQ_ANSWER)];
  // Reranker: unrelated docs score high (0.95..0.55), the relevant FAQ scores
  // just above the floor (0.06) -> ranked 10th, outside topN=8.
  const rerankScores = [0.06];
  for (let i = 0; i < 9; i += 1) {
    const sid = `unrelated-${i}`;
    matches.push(matchFor(sid, 0.2 + i * 0.01));
    rows.push(faqRow(sid, `Unrelated question ${i}?`, `Unrelated answer ${i}.`));
    rerankScores.push(0.95 - i * 0.05);
  }
  return { matches, rows, rerankScores };
}

// ---------------------------------------------------------------------------
// Reranker-level regression
// ---------------------------------------------------------------------------

test("reranker: strongest Vectorize candidate survives reranker top-N cutoff", async () => {
  const { matches, rerankScores } = scenario();
  const { env } = makeMockEnv({ rerankScores });

  const ranked = await rerankCandidates(env, FAQ_QUESTION, matches.map(item), CFG);

  assert.ok(
    ranked.some((r) => r.sourceId === FAQ_ID),
    "the strongest Vectorize FAQ must remain in the reranked context",
  );
  assert.ok(ranked.length <= CFG.rerankTopN, `context size must stay <= topN (got ${ranked.length})`);
  assert.equal(ranked.filter((r) => r.sourceId === FAQ_ID).length, 1, "no duplicates");
});

test("reranker: strongest Vectorize candidate survives when reranker scores it below the floor", async () => {
  const items = [matchFor(FAQ_ID, 0.82), matchFor("unrelated-0", 0.25), matchFor("unrelated-1", 0.22)].map(item);
  const { env } = makeMockEnv({ rerankScores: [0.01, 0.9, 0.8] });

  const ranked = await rerankCandidates(env, FAQ_QUESTION, items, CFG);

  assert.ok(
    ranked.some((r) => r.sourceId === FAQ_ID),
    "a strong Vectorize match must not be lost solely to the reranker floor",
  );
});

test("reranker: already-selected FAQ is returned once and not duplicated", async () => {
  const items = [matchFor(FAQ_ID, 0.82), matchFor("other", 0.2)].map(item);
  const { env } = makeMockEnv({ rerankScores: [0.9, 0.2] });

  const ranked = await rerankCandidates(env, FAQ_QUESTION, items, CFG);

  assert.equal(ranked.length, 2);
  assert.equal(ranked[0].sourceId, FAQ_ID);
  assert.equal(ranked.filter((r) => r.sourceId === FAQ_ID).length, 1);
});

test("reranker: protection still respects the topN context-size limit", async () => {
  const { matches, rerankScores } = scenario();
  const { env } = makeMockEnv({ rerankScores });

  const ranked = await rerankCandidates(env, FAQ_QUESTION, matches.map(item), CFG);

  assert.ok(ranked.length <= CFG.rerankTopN, `got ${ranked.length}`);
});

// ---------------------------------------------------------------------------
// End-to-end (handler) regression: FAQ must reach generator context
// ---------------------------------------------------------------------------

const PARAPHRASES = [
  FAQ_QUESTION,
  "Can I choose which ERP features my business needs?",
  "Can I customize the ERP features for my business?",
  "Can I select only the ERP features I need?",
];

for (const question of PARAPHRASES) {
  test(`chat: relevant FAQ reaches generator context ("${question}")`, async () => {
    const { matches, rows, rerankScores } = scenario();
    const { env, aiCalls } = makeMockEnv({
      matches,
      rows: { faqs: rows },
      rerankScores,
      llmResponse: { response: "Yes, you can choose the features you need." },
    });

    const response = await handleChat(chatRequest(question), env);
    const body = (await response.json()) as any;

    assert.equal(response.status, 200);
    assert.ok(
      body.sources.some((s: any) => s.source_id === FAQ_ID),
      "the FAQ source must be present in the response sources",
    );

    const llmCall = aiCalls.find((c) => c.model.includes("qwen"));
    assert.ok(llmCall, "generator must be called");
    const userPrompt = llmCall!.opts.messages[1].content as string;
    assert.ok(
      userPrompt.includes("choose the ERP features"),
      "the FAQ text must be supplied to the generator context",
    );
  });
}

// ---------------------------------------------------------------------------
// Safe diagnostics (opt-in via CHATBOT_DEBUG_RETRIEVAL)
// ---------------------------------------------------------------------------

test("diagnostics: enabled run reports the protected FAQ without leaking text", async () => {
  const { matches, rows, rerankScores } = scenario();
  const { env } = makeMockEnv({
    matches,
    rows: { faqs: rows },
    rerankScores,
    llmResponse: { response: "Yes, you can choose the features you need." },
  });
  (env as any).CHATBOT_DEBUG_RETRIEVAL = "1";

  const response = await handleChat(chatRequest(FAQ_QUESTION), env);
  const body = (await response.json()) as any;

  assert.equal(body.diagnostics.outcome, "answered");
  assert.ok(
    body.diagnostics.selected.some((s: any) => s.source_id === FAQ_ID),
    "diagnostics must list the selected FAQ",
  );
  assert.ok(
    body.diagnostics.rerank.protected.includes(`faqs:${FAQ_ID}:0`),
    "diagnostics must flag the protected Vectorize candidate",
  );

  const serialized = JSON.stringify(body.diagnostics);
  assert.ok(!serialized.includes("choose the ERP features"), "diagnostics must not leak context text");
  assert.ok(!/secret|token|api[_-]?key/i.test(serialized), "diagnostics must not leak secrets");
});

test("diagnostics: no Vectorize matches is distinguishable", async () => {
  const { env } = makeMockEnv({ matches: [] });
  (env as any).CHATBOT_DEBUG_RETRIEVAL = "1";

  const body = (await (await handleChat(chatRequest("Anything?"), env)).json()) as any;
  assert.equal(body.diagnostics.outcome, "no_vectorize_matches");
});

test("diagnostics: all candidates below the Vectorize threshold is distinguishable", async () => {
  const { env } = makeMockEnv({ matches: [matchFor("weak", 0.05)] });
  (env as any).CHATBOT_DEBUG_RETRIEVAL = "1";

  const body = (await (await handleChat(chatRequest("Anything?"), env)).json()) as any;
  assert.equal(body.diagnostics.outcome, "all_below_vector_threshold");
  assert.equal(body.diagnostics.vectorize.belowThreshold, 1);
});

test("diagnostics: disabled by default (no diagnostics field)", async () => {
  const { matches, rows, rerankScores } = scenario();
  const { env } = makeMockEnv({ matches, rows: { faqs: rows }, rerankScores });

  const body = (await (await handleChat(chatRequest(FAQ_QUESTION), env)).json()) as any;
  assert.equal(body.diagnostics, undefined);
});

