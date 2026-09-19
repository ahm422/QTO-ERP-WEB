/**
 * Environment / Workers bindings type for the chatbot Worker.
 *
 * NOTE: `db` and `vectorize` are populated in wrangler.jsonc before deploy.
 * Until then, the Worker degrades gracefully when they are absent.
 */

export interface Env {
  // Cloudflare D1 (read-only for the chatbot; we never write to the prod DB).
  DB?: any;
  db?: any;

  // Cloudflare Vectorize namespace.
  VECTORIZE?: any;
  vectorize?: any;

  // Cloudflare Workers AI (built-in runtime binding `ai`, typed here for safety).
  AI?: any;
  ai?: any;

  // Plain `vars` overrides — see src/config/index.ts for defaults.
  CHATBOT_EMBEDDING_MODEL?: string;
  CHATBOT_LLM_MODEL?: string;
  CHATBOT_RERANKER_MODEL?: string;
  CHATBOT_EMBEDDING_DIMENSION?: string;
  CHATBOT_VECTORIZE_KEY?: string;
  CHATBOT_EMBEDDING_DIMENSION_OVERRIDE?: string;

  CHATBOT_MAX_INPUT_CHARS?: string;
  CHATBOT_MAX_OUTPUT_TOKENS?: string;
  CHATBOT_MAX_HISTORY_TURNS?: string;
  CHATBOT_MAX_HISTORY_CHARS?: string;

  CHATBOT_RAG_TOP_K?: string;
  CHATBOT_RERANK_TOP_N?: string;
  CHATBOT_MIN_RERANK_SCORE?: string;
  CHATBOT_MIN_VECTORIZE_SCORE?: string;

  CHATBOT_EMBEDDING_BATCH_SIZE?: string;
  CHATBOT_CHUNK_TARGET_TOKENS?: string;
  CHATBOT_CHUNK_OVERLAP_TOKENS?: string;

  CHATBOT_RATE_LIMIT_PER_MINUTE?: string;

  // Admin / indexing auth
  CHATBOT_ADMIN_TOKEN?: string;

  // Shared secret required on `X-Chatbot-Proxy-Secret` for POST /chat. Set via
  // `wrangler secret put CHATBOT_PROXY_SECRET` (never `vars`). Only the Next.js
  // BFF (`/api/chat`) knows this value — the browser never sees it. When unset,
  // /chat is unauthenticated (local dev only; never leave unset in a deployed env).
  CHATBOT_PROXY_SECRET?: string;

  // KV namespace holding the index sync manifest. When bound, reindex runs can
  // prune vectors whose D1 source row was deleted or shrank.
  CHATBOT_SYNC_STATE?: any;

  // Opt-in safe retrieval diagnostics ("1"/"true" to enable).
  CHATBOT_DEBUG_RETRIEVAL?: string;

  [key: string]: string | undefined;
}
