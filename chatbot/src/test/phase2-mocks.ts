/**
 * Shared local mocks for Phase 2 tests. No production bindings are touched.
 * This file is NOT a test (does not match *.test.ts) — it is a helper module.
 */
import { extractSingleRecord } from "../rag/extractors.ts";
import { chunkDocuments } from "../lib/chunker.ts";
import { sha256 } from "../lib/hashing.ts";
import type { Env } from "../types/env.ts";

export const BGE_DIM = 1024;

export function embeddingVector(fill = 0.01): number[] {
  return Array.from({ length: BGE_DIM }, (_, i) => fill + (i % 5) * 1e-6);
}

export interface MockEnvOptions {
  matches?: unknown[];
  rerankScores?: number[];
  failRerank?: boolean;
  invalidRerank?: boolean;
  llmResponse?: unknown;
  queryError?: boolean;
  rows?: Record<string, Array<Record<string, unknown>>>;
}

export interface MockEnvHandle {
  env: Env;
  aiCalls: Array<{ model: string; opts: any }>;
  vectorizeQueries: Array<{ vector: number[]; options: any }>;
  d1Queries: Array<{ sql: string; params: any }>;
  d1Tables: string[];
}

export function makeMockEnv(options: MockEnvOptions = {}): MockEnvHandle {
  const aiCalls: MockEnvHandle["aiCalls"] = [];
  const vectorizeQueries: MockEnvHandle["vectorizeQueries"] = [];
  const d1Queries: MockEnvHandle["d1Queries"] = [];
  const d1Tables: string[] = [];

  const ai = {
    async run(model: string, opts: any) {
      aiCalls.push({ model, opts });
      if (model.includes("bge-m3")) {
        const texts = Array.isArray(opts?.text) ? opts.text : [];
        return { data: texts.map(() => embeddingVector()) };
      }
      if (model.includes("reranker")) {
        if (options.failRerank) throw new Error("reranker failure");
        if (options.invalidRerank) return {};
        const contexts = Array.isArray(opts?.contexts) ? opts.contexts : [];
        const scores =
          options.rerankScores ?? contexts.map((_: unknown, i: number) => 1 - i * 0.1);
        return {
          response: contexts.map((_: unknown, i: number) => ({ id: i, score: scores[i] ?? 0 })),
        };
      }
      return options.llmResponse ?? { response: "Mocked grounded answer." };
    },
  };

  const vectorize = {
    async query(vector: number[], qoptions: any) {
      vectorizeQueries.push({ vector, options: qoptions });
      if (options.queryError) throw new Error("vectorize query failure");
      return { matches: options.matches ?? [] };
    },
  };

  const db = {
    prepare(sql: string) {
      const table = sql.match(/FROM\s+([a-zA-Z_]+)/i)?.[1] ?? "";
      return {
        all: async (params: any) => {
          d1Queries.push({ sql, params });
          d1Tables.push(table);
          const rows = options.rows?.[table] ?? [];
          // Support both positional (`?` => scalar) and named-object bindings.
          const id = params && typeof params === "object" ? params.id : params;
          return id != null ? rows.filter((r) => String(r.id) === String(id)) : rows;
        },
      };
    },
  };

  const env = {
    DB: db,
    AI: ai,
    VECTORIZE: vectorize,
    CHATBOT_VECTORIZE_KEY: "CHATBOT_VECTORS",
    CHATBOT_CHUNK_TARGET_TOKENS: "400",
    CHATBOT_CHUNK_OVERLAP_TOKENS: "50",
  } as unknown as Env;

  return { env, aiCalls, vectorizeQueries, d1Queries, d1Tables };
}

export interface MatchSpec {
  id?: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export function makeMatch(spec: MatchSpec = {}): any {
  return {
    id: spec.id ?? "faqs:faq-1:0",
    score: spec.score ?? 0.9,
    metadata: {
      source_table: "faqs",
      source_id: "faq-1",
      chunk_id: "faq_0",
      chunk_index: 0,
      content_hash: "0".repeat(64),
      updated_at: "2026-09-10T00:00:00.000Z",
      document_type: "faq",
      namespace: "CHATBOT_VECTORS",
      version: "v1",
      ...(spec.metadata ?? {}),
    },
  };
}

/** Build a real FAQ row plus its true chunk metadata (using Phase 1 logic). */
export async function faqFixture(answer = "QTO ERP is an all-in-one business management platform.") {
  const row: Record<string, unknown> = {
    id: "faq-1",
    page_key: "home",
    question: "What is QTO ERP?",
    answer,
    category: "General",
    published: 1,
    updated_at: "2026-09-10T00:00:00.000Z",
  };
  const version = await sha256(JSON.stringify(row));
  const docs = extractSingleRecord("faqs", row);
  const chunks = await chunkDocuments("faqs", "faq-1", docs, String(row.updated_at), version, {
    targetTokens: 400,
    overlapTokens: 50,
  });
  const chunk = chunks[0];
  const match = {
    id: chunk.vectorId,
    score: 0.9,
    metadata: {
      source_table: "faqs",
      source_id: "faq-1",
      chunk_id: chunk.metadata.chunk_id,
      chunk_index: 0,
      content_hash: chunk.metadata.content_hash,
      updated_at: String(row.updated_at),
      document_type: chunk.metadata.document_type,
      namespace: "CHATBOT_VECTORS",
      version,
    },
  };
  return { row, match, text: chunk.text };
}

export function chatRequest(message: unknown, opts: { ip?: string; contentType?: string; rawBody?: string } = {}): Request {
  const headers: Record<string, string> = {
    "CF-Connecting-IP": opts.ip ?? "1.2.3.4",
  };
  if (opts.contentType !== "omit") headers["content-type"] = opts.contentType ?? "application/json";
  const body = opts.rawBody ?? JSON.stringify({ message });
  return new Request("https://chat.local/chat", { method: "POST", headers, body });
}
