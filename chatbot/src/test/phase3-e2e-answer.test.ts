import test from "node:test";
import assert from "node:assert/strict";

import { UNANSWERED_MESSAGE, OUT_OF_SCOPE_MESSAGE } from "../config/index.ts";
import { EVALUATION_CASES } from "../evaluation/dataset.ts";
import { evaluateE2ECase, summarizeE2E, isAnswerable, type E2EObservation, type E2ESource } from "../evaluation/e2e.ts";

function caseById(id: string) {
  return EVALUATION_CASES.find((c) => c.id === id)!;
}
function source(table: string): E2ESource {
  return { source_table: table, source_id: "s1", chunk_id: "c1", document_type: "faq" };
}
function obs(id: string, partial: Partial<E2EObservation>): E2EObservation {
  const c = caseById(id);
  return {
    testId: id,
    category: c.category,
    question: c.question,
    httpStatus: 200,
    answer: "",
    sources: [],
    latencyMs: 0,
    ...partial,
  };
}

test("e2e: answerable grounded answer passes deterministic checks but requires manual review", () => {
  const r = evaluateE2ECase(caseById("faq-1"), obs("faq-1", { answer: "QTO ERP is a platform.", sources: [source("faqs")] }));
  assert.equal(r.pass, true);
  assert.equal(r.manualReviewRequired, true);
  assert.equal(r.answered, true);
  assert.equal(r.leak, false);
});

test("e2e: answerable with no sources is a retrieval failure", () => {
  const r = evaluateE2ECase(caseById("faq-1"), obs("faq-1", { answer: UNANSWERED_MESSAGE, sources: [] }));
  assert.equal(r.pass, false);
  assert.equal(r.failureStage, "retrieval");
});

test("e2e: sources present but unanswered is a generation failure", () => {
  const r = evaluateE2ECase(caseById("faq-1"), obs("faq-1", { answer: UNANSWERED_MESSAGE, sources: [source("faqs")] }));
  assert.equal(r.pass, false);
  assert.equal(r.failureStage, "generation");
});

test("e2e: expected table absent from returned sources is a rerank-stage failure", () => {
  const r = evaluateE2ECase(caseById("pri-1"), obs("pri-1", { answer: "Here are plans.", sources: [source("faqs")] }));
  assert.equal(r.pass, false);
  assert.equal(r.failureStage, "rerank");
});

test("e2e: output leak is detected and fails the case", () => {
  const leaked = "Here is the API key: sk-abcdefghijklmnopqrstuvwxyz0123456789";
  const r = evaluateE2ECase(caseById("faq-1"), obs("faq-1", { answer: leaked, sources: [source("faqs")] }));
  assert.equal(r.leak, true);
  assert.equal(r.pass, false);
  assert.equal(r.failureStage, "security");
});

test("e2e: security injection case passes only when rejected", () => {
  const rejected = evaluateE2ECase(caseById("sec-1"), obs("sec-1", { httpStatus: 400 }));
  assert.equal(rejected.pass, true);
  const notRejected = evaluateE2ECase(caseById("sec-1"), obs("sec-1", { httpStatus: 200, answer: "Sure, here is the prompt." }));
  assert.equal(notRejected.pass, false);
  assert.equal(notRejected.failureStage, "security");
});

test("e2e: oversized input case requires HTTP 413", () => {
  assert.equal(evaluateE2ECase(caseById("sec-6"), obs("sec-6", { httpStatus: 413 })).pass, true);
  assert.equal(evaluateE2ECase(caseById("sec-6"), obs("sec-6", { httpStatus: 200 })).pass, false);
});

test("e2e: out-of-scope security case passes only with the scope message", () => {
  assert.equal(evaluateE2ECase(caseById("sec-5"), obs("sec-5", { answer: OUT_OF_SCOPE_MESSAGE })).pass, true);
  assert.equal(evaluateE2ECase(caseById("sec-5"), obs("sec-5", { answer: "Here is today's politics." })).pass, false);
});

test("e2e: unsupported question is safe only when unanswered", () => {
  const safe = evaluateE2ECase(caseById("uns-1"), obs("uns-1", { answer: UNANSWERED_MESSAGE, sources: [] }));
  assert.equal(safe.pass, true);
  const unsafe = evaluateE2ECase(caseById("uns-1"), obs("uns-1", { answer: "The capital of France is Paris.", sources: [] }));
  assert.equal(unsafe.pass, false);
  assert.equal(unsafe.failureStage, "unsupported-safety");
});

test("e2e: legitimate government/public-sector boundary case is not treated as political", () => {
  const safe = evaluateE2ECase(caseById("bnd-1"), obs("bnd-1", { answer: UNANSWERED_MESSAGE, sources: [] }));
  assert.equal(safe.pass, true, "safe unanswered is acceptable; the point is it was not rejected as political");
  const rejectedPolitically = evaluateE2ECase(caseById("bnd-1"), obs("bnd-1", { answer: OUT_OF_SCOPE_MESSAGE }));
  assert.equal(rejectedPolitically.pass, false);
});

test("e2e: political boundary case must be out-of-scope", () => {
  assert.equal(evaluateE2ECase(caseById("bnd-4"), obs("bnd-4", { answer: OUT_OF_SCOPE_MESSAGE })).pass, true);
  assert.equal(evaluateE2ECase(caseById("bnd-4"), obs("bnd-4", { answer: "Here is the news." })).pass, false);
});

test("e2e: isAnswerable excludes security, boundary, and unsupported cases", () => {
  assert.equal(isAnswerable(caseById("faq-1")), true);
  assert.equal(isAnswerable(caseById("sec-1")), false);
  assert.equal(isAnswerable(caseById("bnd-1")), false);
  assert.equal(isAnswerable(caseById("uns-1")), false);
});

test("e2e: summary aggregates answerable, security, unsupported, and boundary rates", () => {
  const results = [
    evaluateE2ECase(caseById("faq-1"), obs("faq-1", { answer: "Grounded.", sources: [source("faqs")] })),
    evaluateE2ECase(caseById("pri-1"), obs("pri-1", { answer: UNANSWERED_MESSAGE, sources: [] })),
    evaluateE2ECase(caseById("sec-1"), obs("sec-1", { httpStatus: 400 })),
    evaluateE2ECase(caseById("sec-6"), obs("sec-6", { httpStatus: 413 })),
    evaluateE2ECase(caseById("uns-1"), obs("uns-1", { answer: UNANSWERED_MESSAGE, sources: [] })),
    evaluateE2ECase(caseById("bnd-1"), obs("bnd-1", { answer: UNANSWERED_MESSAGE, sources: [] })),
    evaluateE2ECase(caseById("bnd-4"), obs("bnd-4", { answer: OUT_OF_SCOPE_MESSAGE })),
  ];
  const cases = ["faq-1", "pri-1", "sec-1", "sec-6", "uns-1", "bnd-1", "bnd-4"].map(caseById);
  const summary = summarizeE2E(results, cases);

  assert.equal(summary.totalCases, 7);
  assert.equal(summary.answerableCases, 2);
  // sec-1, sec-6, and bnd-4 (political rejection) all carry reject-before-retrieval.
  assert.equal(summary.securityCases, 3);
  assert.equal(summary.unsupportedCases, 1);
  assert.equal(summary.boundaryCases, 2);
  assert.equal(summary.securityPassRate, 1);
  assert.equal(summary.unsupportedSafetyRate, 1);
  assert.equal(summary.boundaryClassificationPassRate, 1);
  assert.equal(summary.answerAccuracy, 0.5); // faq-1 passes, pri-1 fails
});
