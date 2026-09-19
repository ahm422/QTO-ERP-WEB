import test from "node:test";
import assert from "node:assert/strict";

import { scheduleRagSync } from "./rag-sync";

/**
 * The trigger must never throw into the Admin Panel write path. Outside a
 * Cloudflare request context (e.g. unit tests) it resolves without error and
 * the write still succeeds.
 */
test("scheduleRagSync never throws without a Cloudflare context", async () => {
  await assert.doesNotReject(() => scheduleRagSync("faqs"));
  await assert.doesNotReject(() => scheduleRagSync("erp_modules"));
});
