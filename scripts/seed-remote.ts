/**
 * Seed remote Cloudflare D1 from local seed data.
 *
 * 1. Runs the normal Drizzle seed against local D1
 * 2. Exports data-only SQL per table (dependency order)
 * 3. Imports into the remote staging or production database
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/seed-remote.ts staging
 *   npx tsx --env-file=.env scripts/seed-remote.ts production
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Insert order respects foreign keys (blog_posts.author_id -> users.id). */
const SEED_TABLES = [
  "users",
  "erp_modules",
  "solutions",
  "site_settings",
  "nav_resources",
  "home_hero",
  "trusted_logos",
  "home_stats",
  "home_sections",
  "built_for_cards",
  "industry_domains",
  "faqs",
  "footer_content",
  "demo_page_content",
  "page_hero_content",
  "about_story",
  "about_values",
  "blog_posts",
] as const;

const TARGETS = {
  staging: "qto-erp-db-staging",
  production: "qto-erp-db-production",
} as const;

type Target = keyof typeof TARGETS;

function run(command: string, args: string[]) {
  execFileSync(command, args, { stdio: "inherit", cwd: process.cwd() });
}

function exportTable(tempDir: string, table: string): string | null {
  const tablePath = join(tempDir, `${table}.sql`);
  run("npx", [
    "wrangler",
    "d1",
    "export",
    "qto-erp-db-production",
    "--local",
    "--no-schema",
    "--output",
    tablePath,
    "--table",
    table,
  ]);

  const sql = readFileSync(tablePath, "utf8");
  const inserts = sql
    .split("\n")
    .filter((line) => line.startsWith("INSERT INTO"));
  if (inserts.length === 0) return null;

  return inserts.join("\n");
}

function main() {
  const target = process.argv[2] as Target | undefined;
  if (!target || !(target in TARGETS)) {
    console.error("Usage: tsx scripts/seed-remote.ts <staging|production>");
    process.exit(1);
  }

  const databaseName = TARGETS[target];
  const tempDir = mkdtempSync(join(tmpdir(), "qto-erp-seed-"));
  const sqlPath = join(tempDir, "seed.sql");

  try {
    console.log("Step 1/3: seeding local D1...");
    run("npm", ["run", "db:seed"]);

    console.log("Step 2/3: exporting local seed data...");
    writeFileSync(sqlPath, "PRAGMA defer_foreign_keys=TRUE;\n");
    for (const table of SEED_TABLES) {
      const inserts = exportTable(tempDir, table);
      if (inserts) {
        appendFileSync(sqlPath, `${inserts}\n`);
        console.log(`  exported ${table}`);
      }
    }

    console.log(`Step 3/3: importing into remote ${databaseName}...`);
    const executeArgs = [
      "wrangler",
      "d1",
      "execute",
      databaseName,
      "--remote",
      "--file",
      sqlPath,
    ];
    if (target === "staging") {
      executeArgs.push("--env", "staging");
    }
    run("npx", executeArgs);

    console.log(`Done. Remote D1 seeded: ${databaseName}`);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

main();
