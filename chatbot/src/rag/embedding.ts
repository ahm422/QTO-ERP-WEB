import type { Env } from "../types/env.ts";

export const BGE_M3_MODEL = "@cf/baai/bge-m3" as const;
export const BGE_M3_DIMENSION = 1024;

export interface EmbedBatchOptions {
  batchSize?: number;
  truncateInputs?: boolean;
}

function normalizeTexts(texts: string[]): string[] {
  return texts
    .map((text) => String(text ?? "").trim())
    .filter((text) => text.length > 0);
}

function normalizeEmbeddingVector(value: unknown, index: number): number[] {
  if (!Array.isArray(value)) {
    throw new Error(`Embedding ${index} is not an array.`);
  }
  const normalized = value.map((n) => Number(n));
  if (normalized.some((n) => !Number.isFinite(n))) {
    throw new Error(`Embedding ${index} contains non-finite values.`);
  }
  if (normalized.length !== BGE_M3_DIMENSION) {
    throw new Error(
      `Embedding ${index} has invalid dimension ${normalized.length}; expected ${BGE_M3_DIMENSION}.`,
    );
  }
  return normalized;
}

export function extractEmbeddingRows(response: unknown, expectedCount: number): number[][] {
  const payload = response as Record<string, unknown> | null;
  const data = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.response)
      ? payload.response
      : null;

  if (!Array.isArray(data)) {
    throw new Error(`Invalid Workers AI embedding response: missing 'data' or 'response' array.`);
  }

  if (data.length !== expectedCount) {
    throw new Error(
      `Invalid Workers AI embedding response: expected ${expectedCount} embeddings, got ${data.length}.`,
    );
  }

  return data.map((row, index) => normalizeEmbeddingVector(row, index));
}

export async function embedTexts(
  env: Env,
  texts: string[],
  options: EmbedBatchOptions = {},
): Promise<number[][]> {
  const batchSize = options.batchSize ?? 32;
  const normalized = normalizeTexts(texts);

  if (normalized.length === 0) {
    return [];
  }

  const ai = env.AI ?? env.ai;
  if (!ai || typeof ai.run !== "function") {
    throw new Error("Missing Workers AI binding: env.AI.run is not available.");
  }

  const results: number[][] = [];

  for (let start = 0; start < normalized.length; start += batchSize) {
    const batch = normalized.slice(start, start + batchSize);
    const response = await ai.run(BGE_M3_MODEL, {
      text: batch,
      truncate_inputs: options.truncateInputs ?? true,
    });
    const embeddings = extractEmbeddingRows(response, batch.length);
    results.push(...embeddings);
  }

  return results;
}

export async function embedText(env: Env, text: string, options: EmbedBatchOptions = {}): Promise<number[]> {
  const [embedding] = await embedTexts(env, [text], options);
  if (!embedding) {
    throw new Error("Workers AI did not return an embedding for the supplied text.");
  }
  return embedding;
}
