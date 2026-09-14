import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { chatSchema } from "./chat";

describe("chatSchema", () => {
  it("accepts a normal message", () => {
    const parsed = chatSchema.safeParse({ message: "What pricing plans are available?" });
    assert.equal(parsed.success, true);
  });

  it("trims surrounding whitespace", () => {
    const parsed = chatSchema.safeParse({ message: "  hello  " });
    assert.equal(parsed.success, true);
    if (parsed.success) assert.equal(parsed.data.message, "hello");
  });

  it("rejects an empty message", () => {
    const parsed = chatSchema.safeParse({ message: "" });
    assert.equal(parsed.success, false);
  });

  it("rejects a whitespace-only message", () => {
    const parsed = chatSchema.safeParse({ message: "   " });
    assert.equal(parsed.success, false);
  });

  it("rejects a missing message field", () => {
    const parsed = chatSchema.safeParse({});
    assert.equal(parsed.success, false);
  });

  it("accepts a message at exactly 2000 characters", () => {
    const parsed = chatSchema.safeParse({ message: "a".repeat(2000) });
    assert.equal(parsed.success, true);
  });

  it("rejects a message over 2000 characters", () => {
    const parsed = chatSchema.safeParse({ message: "a".repeat(2001) });
    assert.equal(parsed.success, false);
  });

  it("rejects a non-string message", () => {
    const parsed = chatSchema.safeParse({ message: 12345 });
    assert.equal(parsed.success, false);
  });
});
