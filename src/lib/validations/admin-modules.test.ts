import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { updateModuleSchema } from "./admin-modules";

describe("updateModuleSchema — CMS page-copy overrides", () => {
  it("accepts a partial payload of new copy fields", () => {
    const parsed = updateModuleSchema.safeParse({
      heroEyebrow: "Platform Module",
      capabilitiesTag: "What it does",
      ctaHeadline: "Ready to go?",
      aboutSectionHeadings: ["Overview", "Impact"],
    });
    assert.equal(parsed.success, true);
  });

  it("accepts null (clear override → use code default)", () => {
    const parsed = updateModuleSchema.safeParse({
      heroEyebrow: null,
      metaTitle: null,
    });
    assert.equal(parsed.success, true);
  });

  it("allows a relative href and an absolute http(s) href", () => {
    assert.equal(
      updateModuleSchema.safeParse({ ctaPrimaryHref: "/demo?x=1" }).success,
      true,
    );
    assert.equal(
      updateModuleSchema.safeParse({
        ctaPrimaryHref: "https://example.com/x",
      }).success,
      true,
    );
  });

  it("rejects a non-http scheme / bare word href", () => {
    assert.equal(
      updateModuleSchema.safeParse({ ctaPrimaryHref: "javascript:alert(1)" })
        .success,
      false,
    );
    assert.equal(
      updateModuleSchema.safeParse({ ctaSecondaryHref: "demo" }).success,
      false,
    );
  });

  it("rejects an oversized string", () => {
    const parsed = updateModuleSchema.safeParse({
      heroEyebrow: "x".repeat(81),
    });
    assert.equal(parsed.success, false);
  });

  it("rejects unknown keys (strict)", () => {
    const parsed = updateModuleSchema.safeParse({ notAField: "x" });
    assert.equal(parsed.success, false);
  });
});
