import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { updateSolutionSchema } from "./admin-solutions";

describe("updateSolutionSchema — CMS page-copy overrides", () => {
  it("accepts a partial payload of new copy fields", () => {
    const parsed = updateSolutionSchema.safeParse({
      heroEyebrow: "Industry Solution",
      heroImage: "solution-images/abc123.webp",
      tabsIntroTitle: "See how it works",
      ctaHeadline: "Let's talk",
    });
    assert.equal(parsed.success, true);
  });

  it("accepts null to clear an override", () => {
    const parsed = updateSolutionSchema.safeParse({
      heroImage: null,
      heroCaption: null,
    });
    assert.equal(parsed.success, true);
  });

  it("allows relative and absolute hrefs, rejects other schemes", () => {
    assert.equal(
      updateSolutionSchema.safeParse({ heroPrimaryCtaHref: "/demo" }).success,
      true,
    );
    assert.equal(
      updateSolutionSchema.safeParse({
        ctaSecondaryHref: "https://x.test/y",
      }).success,
      true,
    );
    assert.equal(
      updateSolutionSchema.safeParse({ ctaPrimaryHref: "ftp://x" }).success,
      false,
    );
  });

  it("rejects an oversized meta description", () => {
    const parsed = updateSolutionSchema.safeParse({
      metaDescription: "x".repeat(501),
    });
    assert.equal(parsed.success, false);
  });

  it("rejects unknown keys (strict)", () => {
    assert.equal(
      updateSolutionSchema.safeParse({ bogus: true }).success,
      false,
    );
  });
});
