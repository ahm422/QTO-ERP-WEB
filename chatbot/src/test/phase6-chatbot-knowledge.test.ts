import { describe, test } from "node:test";
import * as assert from "node:assert/strict";
import { extractAll, extractChatbotKnowledge, extractSingleRecord } from "../rag/extractors.ts";

const row = {
  id: "k1",
  title: "Refund policy",
  body: "Refunds are issued within 14 days.\n\nContact support to start one.",
  category: "Billing",
  enabled: 1,
};

describe("extractChatbotKnowledge", () => {
  test("enabled row produces a chatbot_knowledge document", () => {
    const docs = extractChatbotKnowledge([row]);
    assert.equal(docs.length, 1);
    assert.equal(docs[0].document_type, "chatbot_knowledge");
    assert.equal(
      docs[0].text,
      "Chatbot knowledge — Refund policy / Billing\nRefunds are issued within 14 days.\n\nContact support to start one.",
    );
  });

  test("category is omitted when empty", () => {
    const [doc] = extractChatbotKnowledge([{ ...row, category: null }]);
    assert.ok(doc.text.startsWith("Chatbot knowledge — Refund policy\n"));
  });

  test("disabled rows produce nothing (0, false, '0')", () => {
    for (const enabled of [0, false, "0"]) {
      assert.deepEqual(extractChatbotKnowledge([{ ...row, enabled }]), []);
    }
  });

  test("accepts boolean true and strips HTML", () => {
    const [doc] = extractChatbotKnowledge([{ ...row, enabled: true, body: "<p>Hello <b>world</b></p>" }]);
    assert.ok(doc.text.endsWith("\nHello world"));
  });

  test("rows without title or body are skipped", () => {
    assert.deepEqual(extractChatbotKnowledge([{ ...row, title: " " }, { ...row, body: "" }]), []);
  });

  test("wired into extractSingleRecord and extractAll", () => {
    assert.equal(extractSingleRecord("chatbot_knowledge", row).length, 1);
    assert.deepEqual(extractSingleRecord("chatbot_knowledge", { ...row, enabled: 0 }), []);
    assert.equal(extractAll({ chatbot_knowledge: [row, { ...row, id: "k2", enabled: 0 }] }).length, 1);
  });
});
