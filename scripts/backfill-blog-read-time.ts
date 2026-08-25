/**
 * Backfill blog_posts.read_time_minutes from existing HTML.
 * Does not rewrite content. Does not bump updated_at.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/backfill-blog-read-time.ts
 *   npx tsx --env-file=.env scripts/backfill-blog-read-time.ts local
 *
 * Staging/prod (after D1 migration sign-off):
 *   npx tsx --env-file=.env scripts/backfill-blog-read-time.ts staging
 *   npx tsx --env-file=.env scripts/backfill-blog-read-time.ts production
 */
import { execFileSync } from "node:child_process";
import { sql } from "drizzle-orm";
import { blogPosts } from "../src/db/schema";
import { computeReadTime } from "../src/lib/validations/admin-blog";
import { withScriptDb } from "./db";

const TARGETS = ["local", "staging", "production"] as const;
type Target = (typeof TARGETS)[number];

const REMOTE_DATABASES = {
  staging: "qto-erp-db-staging",
  production: "qto-erp-db-production",
} as const;

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

function wranglerExecute(
  target: "staging" | "production",
  command: string,
  json = false,
): string {
  const databaseName = REMOTE_DATABASES[target];
  const args = [
    "wrangler",
    "d1",
    "execute",
    databaseName,
    "--remote",
    "--command",
    command,
  ];
  if (json) args.push("--json");
  if (target === "staging") {
    args.splice(4, 0, "--env", "staging");
  }
  return execFileSync("npx", args, {
    encoding: "utf8",
    cwd: process.cwd(),
  });
}

async function backfillLocal() {
  let updated = 0;
  await withScriptDb(async (db) => {
    const rows = await db
      .select({ id: blogPosts.id, content: blogPosts.content })
      .from(blogPosts);
    for (const row of rows) {
      const minutes = computeReadTime(row.content);
      await db.run(
        sql`UPDATE blog_posts SET read_time_minutes = ${minutes} WHERE id = ${row.id}`,
      );
      updated += 1;
    }
  });
  return updated;
}

function backfillRemote(target: "staging" | "production") {
  const raw = wranglerExecute(
    target,
    "SELECT id, content FROM blog_posts",
    true,
  );
  const parsed = JSON.parse(raw) as Array<{
    results?: Array<{ id: string; content: string }>;
  }>;
  const rows = parsed.flatMap((batch) => batch.results ?? []);
  for (const row of rows) {
    const minutes = computeReadTime(row.content ?? "");
    wranglerExecute(
      target,
      `UPDATE blog_posts SET read_time_minutes = ${minutes} WHERE id = '${escapeSql(row.id)}'`,
    );
  }
  return rows.length;
}

async function main() {
  const target = (process.argv[2] ?? "local") as Target;
  if (!TARGETS.includes(target)) {
    console.error(`Usage: tsx scripts/backfill-blog-read-time.ts <${TARGETS.join("|")}>`);
    process.exit(1);
  }

  const updated =
    target === "local" ? await backfillLocal() : backfillRemote(target);
  console.log(`Updated read_time_minutes on ${updated} post(s) (${target}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
