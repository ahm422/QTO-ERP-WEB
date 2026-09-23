/**
 * Reindex orchestrator.
 *
 * Runs the incremental indexer (upsert new/changed content) and then prunes
 * vectors whose source row no longer exists in D1 (or whose content shrank to
 * fewer chunks), using the KV-backed sync manifest from last run.
 *
 * This is the single entry point used by both the cron `scheduled` handler and
 * the protected `POST /index` admin route.
 */
import { buildVectorId } from "../types/core.ts";
import { indexApprovedTables, type IndexOptions, type PhaseOneIndexSummary } from "./indexer.ts";
import { deleteStaleVectors } from "./vectorize.ts";
import {
  getSyncKv,
  parseSourceKey,
  readManifest,
  writeManifest,
  type SyncManifest,
} from "./sync-state.ts";
import type { Env } from "../types/env.ts";

export interface ReindexOptions extends IndexOptions {
  /** Delete vectors whose source row is gone/shrunk. Default: true. */
  prune?: boolean;
}

export interface ReindexResult {
  dryRun: boolean;
  prune: boolean;
  /** Set when pruning was requested but could not run. */
  pruneSkippedReason?: string;
  startedAt: string;
  finishedAt: string;
  tables: string[];
  vectorsDeleted: number;
  /** Number of vectors that *would* be deleted (populated on dry runs). */
  vectorsDeletePlanned: number;
  manifestWritten: boolean;
  index: PhaseOneIndexSummary;
}

/**
 * Compute the deterministic vector ids that should be removed given the previous
 * manifest and the current per-source chunk counts. Returns [] when KV is not
 * configured (nothing to diff against).
 */
export function planPruneDeletions(
  previous: SyncManifest | null,
  current: Record<string, number>,
  scannedTables: Set<string>,
): string[] {
  if (!previous || !previous.sources) return [];

  const ids: string[] = [];
  for (const [key, entry] of Object.entries(previous.sources)) {
    const parsed = parseSourceKey(key);
    if (!parsed) continue;
    const { table, sourceId } = parsed;
    if (!scannedTables.has(table)) continue;

    const previousChunks = Number(entry?.chunks ?? 0);
    const currentChunks = Number(current[key] ?? 0);
    if (!Number.isFinite(previousChunks) || previousChunks <= currentChunks) continue;

    for (let index = currentChunks; index < previousChunks; index += 1) {
      ids.push(buildVectorId(table, sourceId, index));
    }
  }
  return ids;
}

export async function runReindex(
  env: Env,
  options: ReindexOptions = {},
): Promise<ReindexResult> {
  const startedAt = new Date().toISOString();
  const dryRun = options.dryRun === true;
  const prune = options.prune !== false;
  const namespace = env.CHATBOT_VECTORIZE_KEY ?? "CHATBOT_VECTORS";

  const index = await indexApprovedTables(env, {
    tables: options.tables,
    batchSize: options.batchSize,
    maxRecordsPerTable: options.maxRecordsPerTable,
    dryRun,
    skipUnchanged: options.skipUnchanged,
  });

  const scannedTables = new Set(index.tablesScanned);
  let vectorsDeleted = 0;
  let vectorsDeletePlanned = 0;
  let pruneSkippedReason: string | undefined;
  let manifestWritten = false;

  if (prune) {
    const kv = getSyncKv(env);
    if (!kv) {
      pruneSkippedReason = "sync-state KV binding (CHATBOT_SYNC_STATE) is not configured";
    } else {
      const previous = await readManifest(env, namespace);
      const staleIds = planPruneDeletions(previous, index.indexedSources, scannedTables);
      vectorsDeletePlanned = staleIds.length;

      if (!dryRun && staleIds.length > 0) {
        const deleted = await deleteStaleVectors(env, staleIds);
        vectorsDeleted = deleted.length;
      } else if (dryRun) {
        vectorsDeleted = staleIds.length;
      }
    }
  }

  const finishedAt = new Date().toISOString();

  if (!dryRun && !pruneSkippedReason) {
    const sources: SyncManifest["sources"] = {};
    for (const [key, chunks] of Object.entries(index.indexedSources)) {
      sources[key] = { chunks };
    }
    manifestWritten = await writeManifest(env, {
      version: 1,
      namespace,
      updatedAt: finishedAt,
      sources,
    });
  }

  return {
    dryRun,
    prune,
    pruneSkippedReason,
    startedAt,
    finishedAt,
    tables: index.tablesScanned,
    vectorsDeleted,
    vectorsDeletePlanned,
    manifestWritten,
    index,
  };
}
