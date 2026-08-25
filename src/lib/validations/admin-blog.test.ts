import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeReadTime,
  createBlogPostSchema,
  slugifyTitle,
} from "./admin-blog";

describe("computeReadTime", () => {
  it("returns 1 for empty HTML", () => {
    assert.equal(computeReadTime(""), 1);
    assert.equal(computeReadTime("   "), 1);
    assert.equal(computeReadTime("<p></p>"), 1);
  });

  it("treats ~200 words as 1 minute and ~400 as 2", () => {
    const words200 = Array.from({ length: 200 }, () => "word").join(" ");
    const words400 = Array.from({ length: 400 }, () => "word").join(" ");
    assert.equal(computeReadTime(words200), 1);
    assert.equal(computeReadTime(words400), 2);
  });

  it("does not inflate the count with HTML tags or entities", () => {
    assert.equal(computeReadTime("<p>Hello <strong>world</strong></p>"), 1);
    const html = "<p>Hello &amp; <em>world</em></p>";
    assert.equal(computeReadTime(html), 1);
  });
});

describe("slugifyTitle", () => {
  it("kebab-cases titles", () => {
    assert.equal(slugifyTitle("Hello World"), "hello-world");
    assert.equal(slugifyTitle("  ERP  Insights!! "), "erp-insights");
  });
});

describe("createBlogPostSchema", () => {
  const valid = {
    slug: "hello-world",
    title: "Hello World",
    category: "Product",
    excerpt: "A short excerpt",
    content: "<p>Hello</p>",
    tags: ["erp", "construction"],
    coverImageUrl: "/api/media/blog-covers/abc/file.webp",
    isFeatured: true,
    isCompanyNews: true,
    metaTitle: "Hello World | QTO ERP",
    metaDescription: "A short excerpt for search engines.",
  };

  it("accepts a valid payload with tags, cover, featured, company news, and SEO", () => {
    const parsed = createBlogPostSchema.safeParse(valid);
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.deepEqual(parsed.data.tags, ["erp", "construction"]);
      assert.equal(parsed.data.isFeatured, true);
      assert.equal(parsed.data.isCompanyNews, true);
      assert.equal(parsed.data.coverImageUrl, valid.coverImageUrl);
    }
  });

  it("defaults isCompanyNews to undefined when omitted", () => {
    const { isCompanyNews: _isCompanyNews, ...withoutFlag } = valid;
    const parsed = createBlogPostSchema.safeParse(withoutFlag);
    assert.equal(parsed.success, true);
    if (parsed.success) {
      assert.equal(parsed.data.isCompanyNews, undefined);
    }
  });

  it("rejects an invalid slug", () => {
    const parsed = createBlogPostSchema.safeParse({
      ...valid,
      slug: "Hello World",
    });
    assert.equal(parsed.success, false);
  });

  it("rejects too many tags", () => {
    const parsed = createBlogPostSchema.safeParse({
      ...valid,
      tags: Array.from({ length: 13 }, (_, i) => `tag-${i}`),
    });
    assert.equal(parsed.success, false);
  });

  it("rejects javascript: cover URLs", () => {
    const parsed = createBlogPostSchema.safeParse({
      ...valid,
      coverImageUrl: "javascript:alert(1)",
    });
    assert.equal(parsed.success, false);
  });

  it("defaults tags to an empty array", () => {
    const { tags: _tags, ...withoutTags } = valid;
    const parsed = createBlogPostSchema.parse(withoutTags);
    assert.deepEqual(parsed.tags, []);
  });
});
