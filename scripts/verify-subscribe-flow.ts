/**
 * Newsletter subscribe matcher + HTTP checks against a running server.
 *
 * Usage: npm run verify:subscribe
 * Optional: AUTH_BASE_URL=http://localhost:3000 (default)
 *
 * Production reproduce (2026-08-20, Worker qto-erp-web / qtoerp.com):
 * - Unique POST → 201 { ok: true, id }
 * - Duplicate POST → 500 { error: "Something went wrong. Please try again." }
 * - wrangler tail --format json errorInfo (cause not serialized by Workers):
 *   {
 *     name: "Error",
 *     message: "Failed query: insert into \"newsletter_subscribers\" ...
 *               returning ...\nparams: ...,bug009-1787200836@example.com,...",
 *     stack: "    at eS.queryWithCache (cf-worker.js:239642:21)\n..."
 *   }
 * drizzle-orm wraps the D1 unique failure as DrizzleQueryError whose
 * message is Failed query / params; UNIQUE text is on err.cause.
 */
import { isSqliteUniqueConstraintError } from "../src/lib/db-errors";

const baseUrl = process.env.AUTH_BASE_URL ?? "http://localhost:3000";

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

/** Exact production Worker `errorInfo[1].message` from wrangler tail JSON. */
const PRODUCTION_FAILED_QUERY =
  'Failed query: insert into "newsletter_subscribers" ("id", "email", "subscribed_at", "unsubscribed_at") values (?, ?, ?, null) returning "id", "email", "subscribed_at", "unsubscribed_at"\nparams: i6h15n6yodc3gcgr8znywc8c,bug009-1787200836@example.com,1787201004';

const PRODUCTION_D1_UNIQUE =
  "D1_ERROR: UNIQUE constraint failed: newsletter_subscribers.email";

function withCause(message: string, cause: unknown): Error {
  const err = new Error(message);
  err.cause = cause;
  return err;
}

function assertMatcher(): void {
  assert(
    isSqliteUniqueConstraintError(
      new Error("UNIQUE constraint failed: newsletter_subscribers.email"),
    ),
    "plain Error unique message should match",
  );

  assert(
    isSqliteUniqueConstraintError(
      withCause("insert failed", new Error(PRODUCTION_D1_UNIQUE)),
    ),
    "Error + cause unique message should match",
  );

  assert(
    isSqliteUniqueConstraintError(
      withCause(PRODUCTION_FAILED_QUERY, new Error(PRODUCTION_D1_UNIQUE)),
    ),
    "drizzle Failed query wrapper + D1 unique cause should match",
  );

  assert(
    isSqliteUniqueConstraintError(
      withCause(PRODUCTION_FAILED_QUERY, {
        message: PRODUCTION_D1_UNIQUE,
        code: "SQLITE_CONSTRAINT_UNIQUE",
      }),
    ),
    "drizzle wrapper + non-Error D1 object cause should match",
  );

  assert(
    isSqliteUniqueConstraintError(new Error(PRODUCTION_D1_UNIQUE)),
    "D1_ERROR UNIQUE constraint failed should match",
  );

  const nested = withCause(PRODUCTION_FAILED_QUERY, withCause("D1_ERROR", new Error(PRODUCTION_D1_UNIQUE)));
  assert(
    isSqliteUniqueConstraintError(nested),
    "nested cause unique should match",
  );

  assert(
    !isSqliteUniqueConstraintError(new Error(PRODUCTION_FAILED_QUERY)),
    "Failed query with no unique cause must not match",
  );
  assert(
    !isSqliteUniqueConstraintError(new Error("D1_ERROR: no such table: newsletter_subscribers")),
    "missing table must not match",
  );
  assert(
    !isSqliteUniqueConstraintError(new Error("D1_ERROR: database is locked")),
    "generic D1_ERROR must not match",
  );
  assert(
    !isSqliteUniqueConstraintError({ message: "Something went wrong" }),
    "generic object must not match",
  );
  assert(!isSqliteUniqueConstraintError(null), "null must not match");

  // Same helper is used by admin blog slug 409.
  assert(
    isSqliteUniqueConstraintError({
      message: "Failed query: insert into blog_posts",
      cause: { message: "UNIQUE constraint failed: blog_posts.slug" },
    }),
    "blog slug unique (same helper) should match",
  );

  console.log("Matcher unit checks passed.");
}

async function assertHttp(): Promise<void> {
  console.log(`Verifying subscribe HTTP at ${baseUrl}…`);

  const stamp = Date.now();
  const email = `verify-subscribe-${stamp}@example.com`;

  const invalidJson = await fetch(`${baseUrl}/api/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert(invalidJson.status === 400, `invalid JSON: expected 400, got ${invalidJson.status}`);
  console.log("POST /api/subscribe invalid JSON → 400");

  const invalidEmail = await fetch(`${baseUrl}/api/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "not-an-email" }),
  });
  assert(invalidEmail.status === 400, `invalid email: expected 400, got ${invalidEmail.status}`);
  console.log("POST /api/subscribe invalid email → 400");

  const first = await fetch(`${baseUrl}/api/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const firstBody = (await first.json().catch(() => ({}))) as {
    ok?: boolean;
    id?: string;
    error?: string;
  };
  assert(
    first.status === 201 && firstBody.ok === true && firstBody.id,
    `unique insert: expected 201 { ok, id }, got ${first.status} ${JSON.stringify(firstBody)}`,
  );
  console.log(`POST /api/subscribe unique → 201 (id=${firstBody.id})`);

  const duplicate = await fetch(`${baseUrl}/api/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const duplicateBody = (await duplicate.json().catch(() => ({}))) as {
    error?: string;
  };
  assert(
    duplicate.status === 409,
    `duplicate: expected 409, got ${duplicate.status} ${JSON.stringify(duplicateBody)}`,
  );
  assert(
    duplicate.status !== 500,
    "duplicate must never return 500",
  );
  assert(
    duplicateBody.error === "Already subscribed",
    `duplicate body: expected Already subscribed, got ${JSON.stringify(duplicateBody)}`,
  );
  console.log('POST /api/subscribe duplicate → 409 { "error": "Already subscribed" }');

  const caseVariant = await fetch(`${baseUrl}/api/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.toUpperCase() }),
  });
  const caseBody = (await caseVariant.json().catch(() => ({}))) as {
    error?: string;
  };
  assert(
    caseVariant.status === 409 && caseBody.error === "Already subscribed",
    `case variant: expected 409 Already subscribed, got ${caseVariant.status} ${JSON.stringify(caseBody)}`,
  );
  console.log("POST /api/subscribe case-variant duplicate → 409");
}

async function main(): Promise<void> {
  assertMatcher();
  try {
    await assertHttp();
  } catch (err) {
    const text = err instanceof Error ? `${err.message} ${String(err.cause ?? "")}` : String(err);
    if (/ECONNREFUSED|fetch failed|UND_ERR_SOCKET/i.test(text)) {
      console.error(
        `HTTP checks need this app running at ${baseUrl} (not another project on :3000).\n` +
          `Example: npx next dev --webpack -p 3010 -H 127.0.0.1\n` +
          `Then: AUTH_BASE_URL=http://127.0.0.1:3010 npm run verify:subscribe`,
      );
    }
    throw err;
  }
  console.log("All subscribe flow checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
