/**
 * Create or update the admin superuser (role: ADMIN).
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/create-admin.ts [local|staging|production]
 *
 * Requires ADMIN_EMAIL and ADMIN_PASSWORD in the environment.
 */
import { execFileSync } from "node:child_process";
import { createId } from "@paralleldrive/cuid2";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../src/db/schema";
import { users } from "../src/db/schema";

const TARGETS = ["local", "staging", "production"] as const;
type Target = (typeof TARGETS)[number];

const REMOTE_DATABASES = {
  staging: "qto-erp-db-staging",
  production: "qto-erp-db-production",
} as const;

type WranglerModule = {
  getPlatformProxy: (options?: {
    configPath?: string;
    persist?: boolean | { path: string };
    envFiles?: string[];
  }) => Promise<{ env: CloudflareEnv; dispose: () => Promise<void> }>;
};

function escapeSql(value: string): string {
  return value.replace(/'/g, "''");
}

function upsertRemoteAdmin(
  target: "staging" | "production",
  email: string,
  passwordHash: string,
) {
  const databaseName = REMOTE_DATABASES[target];
  const id = createId();
  const now = Math.floor(Date.now() / 1000);
  const sql = `INSERT INTO users (id, email, password_hash, name, role, created_at, updated_at)
VALUES ('${id}', '${escapeSql(email)}', '${escapeSql(passwordHash)}', 'Admin', 'ADMIN', ${now}, ${now})
ON CONFLICT(email) DO UPDATE SET
  password_hash = excluded.password_hash,
  role = 'ADMIN',
  name = 'Admin',
  updated_at = ${now};`;

  const args = [
    "wrangler",
    "d1",
    "execute",
    databaseName,
    "--remote",
    "--command",
    sql,
  ];

  if (target === "staging") {
    args.splice(4, 0, "--env", "staging");
  }

  execFileSync("npx", args, { stdio: "inherit", cwd: process.cwd() });
}

async function upsertLocalAdmin(email: string, passwordHash: string) {
  const { getPlatformProxy } = (await import(
    "wrangler"
  )) as unknown as WranglerModule;

  const proxy = await getPlatformProxy({
    configPath: "wrangler.jsonc",
    persist: { path: ".wrangler/state/v3" },
    envFiles: [],
  });

  const db = drizzle(proxy.env.DB, { schema });

  try {
    await db
      .insert(users)
      .values({
        email,
        passwordHash,
        role: "ADMIN",
        name: "Admin",
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          passwordHash,
          role: "ADMIN",
          name: "Admin",
        },
      });
  } finally {
    await proxy.dispose();
  }
}

async function main() {
  const target = (process.argv[2] ?? "local") as Target;
  if (!TARGETS.includes(target)) {
    console.error(`Usage: tsx scripts/create-admin.ts <${TARGETS.join("|")}>`);
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  if (target === "local") {
    await upsertLocalAdmin(email, passwordHash);
  } else {
    upsertRemoteAdmin(target, email, passwordHash);
  }

  console.log(`Admin user ready on ${target} D1: ${email} (ADMIN)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
