/**
 * Configuration layer for the QTO ERP chatbot.
 *
 * All tunable values live here. Values can be overridden via the Cloudflare
 * `vars` mechanism (wrangler.jsonc) or environment variables.
 * Defaults are safe; every value can be overridden via a `vars` entry.
 */

// --- Models -----------------------------------------------------------------
// Cloudflare Workers AI model IDs. Kept here so we can swap without touching
// the RAG pipeline logic. See https://developers.cloudflare.com/workers-ai/models/

// Preferred embedding model — 384-dim, strong multilingual support.
// NOTE: dimension must match model output when creating the Vectorize index.
export const DEFAULT_EMBEDDING_MODEL = "@cf/baai/bge-m3";
// bge-m3 -> 1024 dim. Override if the embedding model changes.
export const DEFAULT_EMBEDDING_DIMENSION = 1024;

// Instruction model.
export const DEFAULT_LLM_MODEL = "@cf/qwen/qwen3-30b-a3b-fp8";

// Cross-encoder reranker for candidate re-ranking.
export const DEFAULT_RERANKER_MODEL = "@cf/baai/bge-reranker-base";

// --- Tunable limits ----------------------------------------------------------
function intFromEnv(env: Record<string, string | undefined>, key: string, def: number): number {
  const raw = env[key];
  const val = raw != null ? parseInt(raw, 10) : NaN;
  return Number.isNaN(val) ? def : val;
}
function numFromEnv(env: Record<string, string | undefined>, key: string, def: number): number {
  const raw = env[key];
  const val = raw != null ? parseFloat(raw) : NaN;
  return Number.isNaN(val) ? def : val;
}
function boolFromEnv(env: Record<string, string | undefined>, key: string, def: boolean): boolean {
  const raw = env[key];
  if (raw == null) return def;
  const normalized = String(raw).trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export const DEFAULT_MAX_INPUT_CHARS = 2000;
export const DEFAULT_MAX_OUTPUT_TOKENS = 500;
export const DEFAULT_MAX_HISTORY_TURNS = 8; // keep last N user+assistant pairs
export const DEFAULT_MAX_HISTORY_CHARS = 20000;
// Retrieval
export const DEFAULT_RAG_TOP_K = 15;
// Phase 3 controlled tuning (Step 6): rerank recall improvement.
// Evidence: rerankTopN 5->8 recovered cutoff misses (23/29 -> 25/29);
// minRerankScore 0.10->0.05 recovered one threshold miss (25/29 -> 26/29).
export const DEFAULT_RERANK_TOP_N = 8;
export const DEFAULT_MIN_RERANK_SCORE = 0.05; // bge-reranker softmax in [0,1]
export const DEFAULT_MIN_VECTORIZE_SCORE = 0.15; // cosine in [0,1]

export const DEFAULT_EMBEDDING_BATCH_SIZE = 32;

// Chunking
export const DEFAULT_CHUNK_TARGET_TOKENS = 400;
export const DEFAULT_CHUNK_OVERLAP_TOKENS = 50;

// Rate limiting (per-IP per-minute)
export const DEFAULT_RATE_LIMIT_PER_MINUTE = 30;

// Opt-in retrieval diagnostics (safe metadata only; no message text).
export const DEFAULT_DEBUG_RETRIEVAL = false;

// --- Prompt / behaviour ------------------------------------------------------
export const UNANSWERED_MESSAGE =
  "I couldn't find that information in QTO ERP's available company information.";
export const OUT_OF_SCOPE_MESSAGE =
  "I can help with QTO ERP products, modules, solutions, pricing, industries, and company information. I can't provide assistance outside of that scope.";

// --- Effective config ---------------------------------------------------------
export interface ChatbotConfig {
  embeddingModel: string;
  embeddingDimension: number;
  llmModel: string;
  rerankerModel: string;

  maxInputChars: number;
  maxOutputTokens: number;
  maxHistoryTurns: number;
  maxHistoryChars: number;

  ragTopK: number;
  rerankTopN: number;
  minRerankScore: number;
  minVectorizeScore: number;

  embeddingBatchSize: number;
  chunkTargetTokens: number;
  chunkOverlapTokens: number;

  rateLimitPerMinute: number;

  unansweredMessage: string;
  outOfScopeMessage: string;

  /** Emit safe retrieval diagnostics in the response/logs. */
  debugRetrieval: boolean;

  /** Vectorize namespace key to use (from vars). */
  vectorizeKey: string;
}

/**
 * Build the fully-resolved config from the Workers `env` object.
 * The `env` parameter is the Cloudflare bindings object passed to `fetch`
 * (wrangler `vars`).
 */
export function buildConfig(env: Record<string, string | undefined> = {}): ChatbotConfig {
  return {
    embeddingModel: env.CHATBOT_EMBEDDING_MODEL ?? env.EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL,
    embeddingDimension: intFromEnv(env, "CHATBOT_EMBEDDING_DIMENSION", DEFAULT_EMBEDDING_DIMENSION),
    llmModel: env.CHATBOT_LLM_MODEL ?? env.LLM_MODEL ?? DEFAULT_LLM_MODEL,
    rerankerModel:
      env.CHATBOT_RERANKER_MODEL ??
      env.RERANKER_MODEL ??
      DEFAULT_RERANKER_MODEL,

    maxInputChars: intFromEnv(env, "CHATBOT_MAX_INPUT_CHARS", DEFAULT_MAX_INPUT_CHARS),
    maxOutputTokens: intFromEnv(env, "CHATBOT_MAX_OUTPUT_TOKENS", DEFAULT_MAX_OUTPUT_TOKENS),
    maxHistoryTurns: intFromEnv(env, "CHATBOT_MAX_HISTORY_TURNS", DEFAULT_MAX_HISTORY_TURNS),
    maxHistoryChars: intFromEnv(env, "CHATBOT_MAX_HISTORY_CHARS", DEFAULT_MAX_HISTORY_CHARS),

    ragTopK: intFromEnv(env, "CHATBOT_RAG_TOP_K", DEFAULT_RAG_TOP_K),
    rerankTopN: intFromEnv(env, "CHATBOT_RERANK_TOP_N", DEFAULT_RERANK_TOP_N),
    minRerankScore: numFromEnv(env, "CHATBOT_MIN_RERANK_SCORE", DEFAULT_MIN_RERANK_SCORE),
    minVectorizeScore: numFromEnv(env, "CHATBOT_MIN_VECTORIZE_SCORE", DEFAULT_MIN_VECTORIZE_SCORE),

    embeddingBatchSize: intFromEnv(env, "CHATBOT_EMBEDDING_BATCH_SIZE", DEFAULT_EMBEDDING_BATCH_SIZE),
    chunkTargetTokens: intFromEnv(env, "CHATBOT_CHUNK_TARGET_TOKENS", DEFAULT_CHUNK_TARGET_TOKENS),
    chunkOverlapTokens: intFromEnv(
      env,
      "CHATBOT_CHUNK_OVERLAP_TOKENS",
      DEFAULT_CHUNK_OVERLAP_TOKENS,
    ),

    rateLimitPerMinute: intFromEnv(env, "CHATBOT_RATE_LIMIT_PER_MINUTE", DEFAULT_RATE_LIMIT_PER_MINUTE),

    unansweredMessage: UNANSWERED_MESSAGE,
    outOfScopeMessage: OUT_OF_SCOPE_MESSAGE,

    debugRetrieval: boolFromEnv(env, "CHATBOT_DEBUG_RETRIEVAL", DEFAULT_DEBUG_RETRIEVAL),

    vectorizeKey: env.CHATBOT_VECTORIZE_KEY ?? "CHATBOT_VECTORS",
  };
}
