import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeBlogHtml } from "./sanitize-blog-html";

describe("sanitizeBlogHtml", () => {
  it("strips script tags", () => {
    const html = sanitizeBlogHtml("<p>Hi</p><script>alert(1)</script>");
    assert.equal(html.includes("<script"), false);
    assert.equal(html.includes("alert(1)"), false);
    assert.match(html, /<p>Hi<\/p>/);
  });

  it("keeps simple paragraphs", () => {
    assert.equal(sanitizeBlogHtml("<p>Hi</p>"), "<p>Hi</p>");
  });

  it("strips onerror handlers on images", () => {
    const html = sanitizeBlogHtml(
      '<img src="/api/media/blog-images/a/b.jpg" alt="cover" onerror="alert(1)">',
    );
    assert.equal(html.includes("onerror"), false);
    assert.equal(html.includes("alert(1)"), false);
    assert.match(html, /src="\/api\/media\/blog-images\/a\/b.jpg"/);
  });

  it("drops javascript: links", () => {
    const html = sanitizeBlogHtml(
      '<a href="javascript:alert(1)">click</a>',
    );
    assert.equal(html.includes("javascript:"), false);
  });

  it("keeps youtube iframes and drops others", () => {
    const kept = sanitizeBlogHtml(
      '<iframe src="https://www.youtube.com/embed/abc123"></iframe>',
    );
    assert.match(kept, /youtube\.com\/embed\/abc123/);

    const dropped = sanitizeBlogHtml(
      '<iframe src="https://evil.example/embed"></iframe>',
    );
    assert.equal(dropped.includes("iframe"), false);
    assert.equal(dropped.includes("evil.example"), false);
  });
});
