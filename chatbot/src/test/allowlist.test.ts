import { describe, test } from "node:test";
import * as assert from "node:assert/strict";
import { isRagAllowedTable } from "../types/allowlist.ts";
import { RAG_ALLOWED_TABLES, EXCLUDED_COLUMNS, PUBLISHED_ONLY_TABLES } from "../types/allowlist.ts";
import { buildVectorId, parseVectorId, approxTokens } from "../types/core.ts";

describe("allowlist", () => {
  test("all 9 configured RAG tables are allowed", () => {
    assert.equal(RAG_ALLOWED_TABLES.length, 9);
    for (const table of RAG_ALLOWED_TABLES) {
      assert.equal(isRagAllowedTable(table), true, `expected ${table} to be allowed`);
    }
  });

  test("chatbot_knowledge is allowed, gated by enabled (not published-only)", () => {
    assert.equal(isRagAllowedTable("chatbot_knowledge"), true);
    assert.equal(PUBLISHED_ONLY_TABLES.has("chatbot_knowledge"), false);
    assert.deepEqual(EXCLUDED_COLUMNS.chatbot_knowledge, ["email", "phone", "full_name", "name"]);
  });

  test("PII tables are NOT allowed", () => {
    const pii = [
      "users",
      "refresh_tokens",
      "password_reset_tokens",
      "contact_inquiries",
      "demo_requests",
      "newsletter_subscribers",
      "subscriptions",
    ];
    for (const table of pii) {
      assert.equal(
        isRagAllowedTable(table),
        false,
        `expected PII table ${table} to be rejected`,
      );
    }
  });

  test("unknown table names are rejected", () => {
    assert.equal(isRagAllowedTable("totally_unknown"), false);
    assert.equal(isRagAllowedTable("USERS"), false);
    assert.equal(isRagAllowedTable(""), false);
  });

  test("excluded columns include PII fields", () => {
    const expected = ["email", "phone", "full_name", "name"];
    for (const col of expected) {
      assert.ok(
        Object.values(EXCLUDED_COLUMNS).some((cols) => cols.includes(col)),
        `expected ${col} to appear in some table's EXCLUDED_COLUMNS`,
      );
    }
  });

  test("published-only tables match PUBLISHED_ONLY_TABLES", () => {
    const expected = ["blog_posts", "erp_modules", "solutions", "faqs", "industry_domains"];
    for (const table of expected) {
      assert.ok(PUBLISHED_ONLY_TABLES.has(table), `${table} should be published-only`);
    }
    for (const table of ["about_story", "demo_page_content", "contact_support_content"]) {
      assert.equal(PUBLISHED_ONLY_TABLES.has(table), false, `${table} should not be published-only`);
    }
  });
});

describe("buildVectorId / parseVectorId", () => {
  test("builds deterministic vector id", () => {
    const id = buildVectorId("faqs", "42", 0);
    assert.equal(id, "faqs:42:0");
  });

  test("parses round-trip", () => {
    const id = buildVectorId("erp_modules", "7", 3);
    const parsed = parseVectorId(id);
    assert.ok(parsed);
    assert.equal(parsed!.table, "erp_modules");
    assert.equal(parsed!.sourceId, "7");
    assert.equal(parsed!.chunkIndex, 3);
  });

  test("parseVectorId rejects malformed id", () => {
    assert.equal(parseVectorId("bogus"), null);
    assert.equal(parseVectorId("a:b:c:d"), null);
    assert.equal(parseVectorId(""), null);
  });

  test("parseVectorId accepts string source ids and rejects malformed chunks", () => {
    assert.deepEqual(parseVectorId("faqs:abc:0"), { table: "faqs", sourceId: "abc", chunkIndex: 0 });
    assert.equal(parseVectorId("faqs:2:neg"), null);
    assert.equal(parseVectorId("faqs:2"), null);
  });
});

describe("approxTokens", () => {
  test("empty string is 0", () => {
    assert.equal(approxTokens(""), 0);
  });

  test("short string is small", () => {
    const n = approxTokens("hello world");
    assert.ok(n >= 2 && n <= 10, `expected 2..10, got ${n}`);
  });

  test("long string scales up", () => {
    const short = approxTokens("the quick brown fox".repeat(5));
    const long = approxTokens("the quick brown fox".repeat(50));
    assert.ok(long > short);
  });
});
