/**
 * Sync-state manifest for the chatbot index.
 *
 * Vectorize has no enumeration API on the Worker binding, so we cannot ask it
 * "what is currently indexed?". Instead we persist a small manifest of the
 * source records we indexed last run, keyed by `table:source_id` with their
 * chunk count. The next reindex diffs against it and deletes any vectors whose
 * source row is gone (or whose chunk count shrank), so D1 deletes/edits
 * propagate to the vector store.
 *
 * The manifest is best-effort: if the KV binding is absent the chatbot still
 * works (upserts only); pruning is simply skipped.
 */
import { isRagAllowedTable } from "../types/allowlist.ts";
import type { Env } from "../types/env.ts";

export interface SyncManifestSource {
  /** Number of chunk vectors stored for this source at last sync. */
  chunks: number;
}

export interface SyncManifest {
  version: 1;
  namespace: string;
  updatedAt: string;
  /** Key format: `table:source_id`. */
  sources: Record<string, SyncManifestSource>;
}

const MANIFEST_PREFIX = "chatbot:sync-manifest:v1";

export function getSyncKv(env: Env): any | null {
  const kv = (env as Record<string, unknown>).CHATBOT_SYNC_STATE;
  return kv && typeof (kv as any).get === "function" && typeof (kv as any).put === "function"
    ? kv
    : null;
}

export function manifestKey(namespace: string): string {
  return `${MANIFEST_PREFIX}:${namespace}`;
}

/** Compose the manifest key used for a given source id. */
export function sourceKey(table: string, sourceId: string): string {
  return `${table}:${sourceId}`;
}

/** Split a `table:source_id` manifest key. Returns null when malformed. */
export function parseSourceKey(key: string): { table: string; sourceId: string } | null {
  const separator = key.indexOf(":");
  if (separator <= 0 || separator === key.length - 1) return null;
  const table = key.slice(0, separator);
  const sourceId = key.slice(separator + 1);
  if (!isRagAllowedTable(table) || sourceId.length === 0) return null;
  return { table, sourceId };
}

export async function readManifest(
  env: Env,
  namespace: string,
): Promise<SyncManifest | null> {
  const kv = getSyncKv(env);
  if (!kv) return null;

  const raw = await kv.get(manifestKey(namespace));
  if (raw == null) return null;

  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== "object" || typeof parsed.sources !== "object") {
      return null;
    }
    return parsed as SyncManifest;
  } catch {
    return null;
  }
}

/** Persist the manifest. Returns false when KV is not configured. */
export async function writeManifest(env: Env, manifest: SyncManifest): Promise<boolean> {
  const kv = getSyncKv(env);
  if (!kv) return false;
  await kv.put(manifestKey(manifest.namespace), JSON.stringify(manifest));
  return true;
}
