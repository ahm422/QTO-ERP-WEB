import { isRagAllowedTable } from "../types/allowlist.ts";
import { parseVectorId, type RagVectorMetadata } from "../types/core.ts";
import type { Env } from "../types/env.ts";

export interface VectorUpsertInput {
  id: string;
  values: number[];
  metadata: Record<string, unknown>;
}

export interface VectorMetadataInput {
  table: string;
  sourceId: string;
  chunkId: string;
  chunkIndex: number;
  contentHash: string;
  updatedAt: string;
  documentType: string;
  version: string;
  namespace?: string;
  sourceTitle?: string;
  question?: string;
  pageKey?: string;
}

export function buildVectorMetadata(input: VectorMetadataInput): RagVectorMetadata & Record<string, unknown> {
  if (!isRagAllowedTable(input.table)) {
    throw new Error(`Vector metadata table "${input.table}" is not in the allowed RAG allowlist.`);
  }

  const metadata: RagVectorMetadata & Record<string, unknown> = {
    source_table: input.table,
    source_id: input.sourceId,
    chunk_id: input.chunkId,
    content_hash: input.contentHash,
    updated_at: input.updatedAt,
    document_type: input.documentType,
    version: input.version,
    chunk_index: input.chunkIndex,
    namespace: input.namespace ?? "CHATBOT_VECTORS",
  };

  if (input.sourceTitle) metadata.source_title = input.sourceTitle;
  if (input.question) metadata.question = input.question;
  if (input.pageKey) metadata.page_key = input.pageKey;

  return metadata;
}

export function vectorMatchesCurrentHash(
  existingMetadata: Record<string, unknown> | undefined,
  contentHash: string,
): boolean {
  const priorHash = existingMetadata && typeof existingMetadata.content_hash === "string"
    ? existingMetadata.content_hash
    : undefined;
  return priorHash === contentHash;
}

export async function upsertVectorBatch(
  env: Env,
  vectors: VectorUpsertInput[],
): Promise<Array<{ id: string }>> {
  const vectorize = env.VECTORIZE ?? env.vectorize;
  if (!vectorize || typeof vectorize.upsert !== "function") {
    throw new Error("Missing Vectorize binding: env.VECTORIZE.upsert is not available.");
  }

  const result = await vectorize.upsert(
    vectors.map((vector) => ({
      id: vector.id,
      values: vector.values,
      metadata: vector.metadata as Record<string, unknown>,
      namespace: env.CHATBOT_VECTORIZE_KEY ?? "CHATBOT_VECTORS",
    })),
  );

  if (result && typeof result === "object") {
    if (typeof (result as { mutationId?: string }).mutationId === "string") {
      return vectors.map((vector) => ({ id: vector.id }));
    }

    if (Array.isArray((result as { ids?: unknown[] }).ids)) {
      return (result as { ids: string[] }).ids.map((id: string) => ({ id }));
    }
  }

  throw new Error(
    `Vectorize upsert returned an unexpected response shape: ${JSON.stringify(result)}`,
  );
}

export async function deleteStaleVectors(env: Env, ids: string[]): Promise<string[]> {
  const safeIds: string[] = [];
  for (const id of ids) {
    const parsed = parseVectorId(id);
    if (parsed && isRagAllowedTable(parsed.table)) {
      safeIds.push(id);
    }
  }

  if (safeIds.length === 0) {
    return [];
  }

  const vectorize = env.VECTORIZE ?? env.vectorize;
  if (!vectorize || typeof vectorize.deleteByIds !== "function") {
    throw new Error("Missing Vectorize binding: env.VECTORIZE.deleteByIds is not available.");
  }

  const response = await vectorize.deleteByIds(safeIds);
  return Array.isArray(response?.ids) ? response.ids : [];
}
