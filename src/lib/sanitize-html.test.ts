import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ensureHtmlContent, sanitizeHtml } from "./sanitize-html";

describe("sanitizeHtml", () => {
  it("strips script tags", () => {
    const html = sanitizeHtml("<p>Hi</p><script>alert(1)</script>");
    assert.equal(html.includes("<script"), false);
    assert.equal(html.includes("alert(1)"), false);
    assert.match(html, /<p>Hi<\/p>/);
  });

  it("keeps simple paragraphs", () => {
    assert.equal(sanitizeHtml("<p>Hello world</p>"), "<p>Hello world</p>");
  });

  it("strips onerror handlers on images", () => {
    const html = sanitizeHtml(
      '<img src="/api/media/x.png" onerror="alert(1)">',
    );
    assert.equal(html.includes("onerror"), false);
  });

  it("drops javascript: links", () => {
    const html = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    assert.equal(html.includes("href"), false);
  });
});

describe("ensureHtmlContent", () => {
  it("returns an empty string for empty/whitespace input", () => {
    assert.equal(ensureHtmlContent(""), "");
    assert.equal(ensureHtmlContent("   "), "");
  });

  it("wraps plain text in a paragraph", () => {
    assert.equal(ensureHtmlContent("Hello world"), "<p>Hello world</p>");
  });

  it("escapes HTML-special characters in plain text", () => {
    const html = ensureHtmlContent("Cats & Dogs <3");
    assert.equal(html.includes("&amp;"), true);
    assert.equal(html.includes("&lt;3"), true);
    assert.equal(html.includes("<3"), false);
  });

  it("splits double newlines into separate paragraphs", () => {
    const html = ensureHtmlContent("First para.\n\nSecond para.");
    assert.equal(html, "<p>First para.</p><p>Second para.</p>");
  });

  it("passes already-HTML content through the sanitizer instead of re-escaping it", () => {
    const html = ensureHtmlContent("<p>Already <strong>rich</strong></p>");
    assert.equal(html, "<p>Already <strong>rich</strong></p>");
  });

  it("still sanitizes unsafe markup in already-HTML content", () => {
    const html = ensureHtmlContent("<p>Hi</p><script>alert(1)</script>");
    assert.equal(html.includes("<script"), false);
  });
});
