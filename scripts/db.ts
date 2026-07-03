import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "../src/db/schema";

export type ScriptDb = DrizzleD1Database<typeof schema>;

type PlatformProxy = {
  env: CloudflareEnv;
  dispose: () => Promise<void>;
};

type WranglerModule = {
  getPlatformProxy: (options?: {
    configPath?: string;
    persist?: { path: string };
    envFiles?: string[];
    environment?: string;
  }) => Promise<PlatformProxy>;
};

export async function withScriptDb<T>(
  fn: (db: ScriptDb) => Promise<T>,
): Promise<T> {
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
    return await fn(db);
  } finally {
    await proxy.dispose();
  }
}
