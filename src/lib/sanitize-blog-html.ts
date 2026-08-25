/**
 * Blog-specific alias over the shared sanitizer (`sanitize-html.ts`).
 * The underlying implementation has no blog-specific logic — kept here so
 * existing blog call sites and tests don't need to change import names.
 */
export { sanitizeHtml as sanitizeBlogHtml } from "./sanitize-html";
