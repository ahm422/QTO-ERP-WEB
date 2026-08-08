import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

export type AppDb = DrizzleD1Database<typeof schema>;

let dbPromise: Promise<AppDb> | null = null;

/**
 * D1 drizzle client. Uses async Cloudflare context so `next dev` can hydrate
 * bindings in the request process even when initOpenNextCloudflareForDev raced
 * or ran in a sibling Next.js process.
 */
export async function getDb(): Promise<AppDb> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const { env } = await getCloudflareContext({ async: true });
      return drizzle(env.DB, { schema });
    })();
  }
  try {
    return await dbPromise;
  } catch (err) {
    dbPromise = null;
    throw err;
  }
}
