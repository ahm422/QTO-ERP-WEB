import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createChatbotKnowledgeSchema,
  updateChatbotKnowledgeSchema,
} from "./admin-chatbot-knowledge";

const valid = {
  title: "What is QTO Dev?",
  body: "QTO Dev builds custom software, including QTO ERP.",
  category: "Company",
  enabled: true,
  sortOrder: 0,
};

describe("createChatbotKnowledgeSchema", () => {
  it("accepts a valid article", () => {
    const parsed = createChatbotKnowledgeSchema.safeParse(valid);
    assert.equal(parsed.success, true);
  });

  it("requires title and body", () => {
    assert.equal(
      createChatbotKnowledgeSchema.safeParse({ title: "", body: "x" }).success,
      false,
    );
    assert.equal(
      createChatbotKnowledgeSchema.safeParse({ title: "x", body: "" }).success,
      false,
    );
  });

  it("rejects a title longer than 200 characters", () => {
    assert.equal(
      createChatbotKnowledgeSchema.safeParse({
        ...valid,
        title: "a".repeat(201),
      }).success,
      false,
    );
  });

  it("rejects a body longer than 20000 characters", () => {
    assert.equal(
      createChatbotKnowledgeSchema.safeParse({
        ...valid,
        body: "a".repeat(20_001),
      }).success,
      false,
    );
  });

  it("allows omitting optional fields", () => {
    const parsed = createChatbotKnowledgeSchema.safeParse({
      title: "Title",
      body: "Body",
    });
    assert.equal(parsed.success, true);
  });
});

describe("updateChatbotKnowledgeSchema", () => {
  it("accepts a partial update", () => {
    const parsed = updateChatbotKnowledgeSchema.safeParse({ enabled: false });
    assert.equal(parsed.success, true);
  });

  it("rejects an empty title when provided", () => {
    assert.equal(
      updateChatbotKnowledgeSchema.safeParse({ title: "   " }).success,
      false,
    );
  });
});
