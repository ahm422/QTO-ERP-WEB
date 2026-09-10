import { RAG_ALLOWED_TABLES, isRagAllowedTable } from "../types/allowlist.ts";
import { buildVectorId, type Chunk } from "../types/core.ts";
import { fetchAllAllowedRecords } from "../lib/d1_reader.ts";
import { sha256 } from "../lib/hashing.ts";
import { chunkDocuments } from "../lib/chunker.ts";
import { extractAll } from "./extractors.ts";
import { embedTexts } from "./embedding.ts";
import { buildVectorMetadata, upsertVectorBatch, vectorMatchesCurrentHash } from "./vectorize.ts";
import type { Env } from "../types/env.ts";

export interface IndexOptions {
  tables?: string[];
  batchSize?: number;
  maxRecordsPerTable?: number;
  dryRun?: boolean;
  skipUnchanged?: boolean;
}

export interface PhaseOneIndexSummary {
  tablesScanned: string[];
  rowsProcessed: number;
  rowsSkipped: number;
  chunksCreated: number;
  embeddingsGenerated: number;
  vectorsUpserted: number;
  failures: string[];
}

function getDb(env: Env): any {
  return env.DB ?? env.db;
}

function getAi(env: Env): any {
  return env.AI ?? env.ai;
}

function getVectorize(env: Env): any {
  return env.VECTORIZE ?? env.vectorize;
}

function toSourceId(record: Record<string, unknown>): string {
  const raw = record.id ?? record.slug ?? record.title ?? record.name ?? record.page_key ?? record.question ?? "unknown";
  return String(raw);
}

function toUpdatedAt(record: Record<string, unknown>): string {
  const raw = record.updated_at ?? record.published_at ?? new Date().toISOString();
  return String(raw);
}

async function toVersion(record: Record<string, unknown>): Promise<string> {
  return sha256(JSON.stringify(record));
}

async function generateChunkBatch(
  table: string,
  sourceId: string,
  record: Record<string, unknown>,
  opts: { chunkTargetTokens: number; chunkOverlapTokens: number },
): Promise<Chunk[]> {
  const docs = extractAll({ [table]: [record] });
  if (docs.length === 0) {
    return [];
  }

  const version = await toVersion(record);
  const updatedAt = toUpdatedAt(record);
  return chunkDocuments(
    table,
    sourceId,
    docs,
    updatedAt,
    version,
    {
      targetTokens: opts.chunkTargetTokens,
      overlapTokens: opts.chunkOverlapTokens,
    },
  );
}

export async function indexApprovedTables(
  env: Env,
  options: IndexOptions = {},
): Promise<PhaseOneIndexSummary> {
  const db = getDb(env);
  const ai = getAi(env);
  const vectorize = getVectorize(env);

  if (!db || typeof db.prepare !== "function") {
    throw new Error("Production D1 binding is not available: env.DB.prepare is missing.");
  }
  if (!ai || typeof ai.run !== "function") {
    throw new Error("Workers AI binding is not available: env.AI.run is missing.");
  }
  if (!vectorize || typeof vectorize.upsert !== "function") {
    throw new Error("Vectorize binding is not available: env.VECTORIZE.upsert is missing.");
  }

  const tables = (options.tables ?? [...RAG_ALLOWED_TABLES]).filter((table) => isRagAllowedTable(table));
  const summary: PhaseOneIndexSummary = {
    tablesScanned: tables,
    rowsProcessed: 0,
    rowsSkipped: 0,
    chunksCreated: 0,
    embeddingsGenerated: 0,
    vectorsUpserted: 0,
    failures: [],
  };

  const bundle = await fetchAllAllowedRecords(db);
  const batchSize = options.batchSize ?? 32;
  const chunkTargetTokens = Number(env.CHATBOT_CHUNK_TARGET_TOKENS ?? "400");
  const chunkOverlapTokens = Number(env.CHATBOT_CHUNK_OVERLAP_TOKENS ?? "50");

  for (const table of tables) {
    const records = bundle[table] ?? [];
    const limit = options.maxRecordsPerTable ?? records.length;
    for (let index = 0; index < Math.min(records.length, limit); index += 1) {
      const record = records[index] as Record<string, unknown>;
      if (!record || typeof record !== "object") {
        continue;
      }

      summary.rowsProcessed += 1;
      const sourceId = toSourceId(record);

      try {
        const chunks = await generateChunkBatch(table, sourceId, record, {
          chunkTargetTokens,
          chunkOverlapTokens,
        });
        summary.chunksCreated += chunks.length;

        if (chunks.length === 0) {
          summary.rowsSkipped += 1;
          continue;
        }

        const vectorsToUpsert: Array<{ id: string; values: number[]; metadata: Record<string, unknown> }> = [];
        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += batchSize) {
          const batch = chunks.slice(chunkIndex, chunkIndex + batchSize);
          const embeddings = await embedTexts(env, batch.map((chunk) => chunk.text), { batchSize });
          summary.embeddingsGenerated += embeddings.length;

          if (embeddings.length !== batch.length) {
            throw new Error(
              `Expected ${batch.length} embeddings for ${table}/${sourceId}, got ${embeddings.length}.`,
            );
          }

          for (let j = 0; j < batch.length; j += 1) {
            const chunk = batch[j];
            const metadata = buildVectorMetadata({
              table,
              sourceId,
              chunkId: chunk.metadata.chunk_id,
              chunkIndex: Number.parseInt(chunk.vectorId.split(":").at(-1) ?? "0", 10),
              contentHash: chunk.metadata.content_hash,
              updatedAt: chunk.metadata.updated_at,
              documentType: chunk.metadata.document_type,
              version: chunk.metadata.version,
              namespace: env.CHATBOT_VECTORIZE_KEY ?? "CHATBOT_VECTORS",
            });

            const vectorId = buildVectorId(table, sourceId, Number.parseInt(chunk.vectorId.split(":").at(-1) ?? "0", 10));
            const current = await vectorize.getByIds([vectorId]).catch(() => [] as Array<Record<string, unknown>>);
            const existing = Array.isArray(current) && current.length > 0 ? current[0] : undefined;
            const unchanged = vectorMatchesCurrentHash(
              (existing && typeof existing.metadata === "object" ? (existing.metadata as Record<string, unknown>) : undefined),
              metadata.content_hash,
            );

            if (options.skipUnchanged !== false && unchanged) {
              summary.rowsSkipped += 1;
              continue;
            }

            vectorsToUpsert.push({
              id: vectorId,
              values: embeddings[j],
              metadata,
            });
          }
        }

        if (vectorsToUpsert.length > 0 && !options.dryRun) {
          await upsertVectorBatch(env, vectorsToUpsert);
          summary.vectorsUpserted += vectorsToUpsert.length;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        summary.failures.push(`${table}:${sourceId}: ${message}`);
      }
    }
  }

  return summary;
}

export async function phaseOneIndexSummary(env: Env, options: IndexOptions = {}): Promise<PhaseOneIndexSummary> {
  return indexApprovedTables(env, options);
}
