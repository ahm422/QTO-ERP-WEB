# QTO ERP Chatbot

A Cloudflare Worker that answers questions about QTO ERP, grounded strictly in
the company's own published data. It reads approved content from the production
D1 database, indexes it into Vectorize, and answers with an LLM only from the
content it retrieved.

This project lives in `chatbot/` and is independent of the main Next.js app. It
has its own `package.json`, `wrangler.jsonc`, and TypeScript config.

---

## What it does

- Answers visitor questions about QTO ERP (modules, solutions, pricing,
  comparison features, FAQs, company info, demos, support).
- Uses only QTO ERP's own published content as its knowledge base.
- Says the information is unavailable when it cannot support an answer, instead
  of making something up.
- Rejects out-of-scope, unsafe, or malicious requests.

It does **not** browse the web, and it does **not** use general world knowledge.

---

## High-level workflow

**Indexing (offline / scheduled)**

```
Production D1 (allowed tables only)
    -> extract text from published rows
    -> normalize (strip HTML, collapse whitespace)
    -> chunk into ~400-token pieces
    -> SHA-256 content hash per chunk
    -> embed each chunk with BGE-M3 (1024 dims)
    -> store in Cloudflare Vectorize (with provenance metadata)
```

**Answering (live, `POST /chat`)**

```
User question
    -> input validation + security classification
    -> embed question with BGE-M3
    -> search Vectorize (similarity)
    -> resolve the matched chunks against current D1 (latest source of truth)
    -> rerank the chunks with BGE reranker
    -> generate an answer with Qwen (context only)
    -> output/leak safety checks
    -> JSON answer + sources
```

Production D1 is always the source of truth. Vectorize only stores embeddings
and small metadata used for search — never a copy of the database.

---

## Where the data comes from

All content comes from the production D1 database, and only from these **10
allowed tables**:

| Table | What it contributes |
|---|---|
| `blog_posts` | Published articles/blog content |
| `industry_domains` | Industry/domain descriptions |
| `about_story` | Company/about copy |
| `demo_page_content` | Demo page copy and process |
| `contact_support_content` | Support/contact page copy |
| `erp_modules` | ERP module descriptions, features, use cases |
| `solutions` | Solution descriptions and recommended modules |
| `pricing_plans` | Plan names, prices, and features |
| `comparison_features` | Plan comparison details |
| `faqs` | Frequently asked questions and answers |

No other tables are read or indexed. Sensitive tables (users, tokens, inquiries,
subscribers, subscriptions, etc.) are never touched.

---

## Models

All models run through **Cloudflare Workers AI** using the single `AI` binding
(`env.AI`). There are no separate model bindings.

| Model ID | Purpose |
|---|---|
| `@cf/baai/bge-m3` | Embeddings (1024 dimensions) for indexing and queries |
| `@cf/baai/bge-reranker-base` | Reranks retrieved chunks by relevance to the question |
| `@cf/qwen/qwen3-30b-a3b-fp8` | Generates the final grounded answer |

Model IDs are centralized in `src/config/index.ts` (overridable via Wrangler
`vars`); no production file hard-codes them.

---

## Vector storage

| Setting | Value |
|---|---|
| Product | Cloudflare Vectorize |
| Index | `qto-erp-chatbot-vectors` |
| Dimensions | 1024 (cosine) |
| Namespace | `CHATBOT_VECTORS` |

Each stored vector carries metadata: source table, source id, chunk id,
chunk index, content hash, updated-at, document type, and version. This lets the
system detect changes and rebuild only what changed.

---

## Current RAG settings

| Setting | Value | Meaning |
|---|---|---|
| `topK` | 15 | Vectorize candidates retrieved |
| `rerankTopN` | 8 | Candidates kept after reranking |
| `minRerankScore` | 0.05 | Minimum reranker score to keep |
| `minVectorizeScore` | 0.15 | Minimum similarity to consider |

Defaults live in `src/config/index.ts` and can be overridden with Wrangler
`vars` (`CHATBOT_RAG_TOP_K`, `CHATBOT_RERANK_TOP_N`,
`CHATBOT_MIN_RERANK_SCORE`, `CHATBOT_MIN_VECTORIZE_SCORE`).

---

## Security and safety

- **Company-only scope** — answers are limited to QTO ERP topics.
- **Allowlisted D1 tables** — only the 10 tables above can ever be read.
- **Prompt-injection protection** — attempts to override instructions, request
  hidden context, or extract internal reasoning are rejected before retrieval.
- **Input limit** — messages longer than 2000 characters are rejected (HTTP 413).
- **Output limit** — answers are capped at 500 tokens.
- **No system-prompt disclosure** — internal instructions are never returned.
- **No SQL/schema/infrastructure disclosure** — database/schema/secret requests
  are rejected.
- **Retrieved data is untrusted** — documents are treated as data, never as
  instructions, so content cannot hijack the bot.
- **Unsupported-question handling** — if the context does not support an answer,
  the bot returns a safe "information unavailable" response.
- **Political/current-news rejection** — these are treated as out of scope.
- **Output leak protection** — generated answers are scanned for leaks
  (credentials, tokens, prompts, schema) before being returned.
- **Rate limiting** — per-IP request limiting is applied. It is per-Worker-
  instance (not a global distributed limit).

---

## Data provenance and source handling

- D1 is read with fixed, parameterized `SELECT` queries only.
- Table names are fixed in code (allowlisted); users can never choose a table,
  index, namespace, or SQL.
- Retrieved chunks are verified against current D1 content before use; the
  system uses the latest D1 text as the source of truth.
- Responses include the sources used (table + ids) so answers are traceable.

---

## Incremental indexing and stale/deleted vectors

- Each chunk stores a SHA-256 `content_hash`. On re-index, chunks whose hash is
  unchanged are skipped **before** embedding (saves cost, avoids duplicates).
- Changed content is re-embedded and updated under the same deterministic
  vector id (`table:source_id:chunk_index`).
- Stale/deleted source vectors can be removed with allowlist-guarded deletion
  helpers. Vectors are never deleted by the chat endpoint.

---

## API

### `POST /chat`

Request:

```json
{ "message": "What pricing plans are available?" }
```

Response:

```json
{
  "answer": "...",
  "sources": [
    { "source_table": "pricing_plans", "source_id": "...", "chunk_id": "...", "document_type": "pricing_plan" }
  ]
}
```

Example with curl:

```bash
curl -s -X POST https://qto-erp-chatbot.your-subdomain.workers.dev/chat \
  -H "content-type: application/json" \
  -d '{"message":"What modules does QTO ERP provide?"}'
```

Other routes:

| Method | Path | Behavior |
|---|---|---|
| GET | `/` | Health check: `{"status":"ok","service":"qto-erp-chatbot"}` |
| POST | `/chat` | Grounded Q&A (JSON) |
| any | other paths | `404 Not Found` |

---

## Deployment and configuration notes

- The Worker is `qto-erp-chatbot`; the Vectorize index it uses is
  `qto-erp-chatbot-vectors` (do not recreate it).
- Bindings (`wrangler.jsonc`): `DB` (production D1), `VECTORIZE`, `AI`.
- Model IDs and RAG settings are centralized in `src/config/index.ts` and can be
  overridden with `vars`.
- Do not change bindings, model IDs, or thresholds without understanding the
  retrieval impact. Re-indexing is incremental and safe to re-run.
- Never point the chatbot at non-allowlisted tables.

---

## Known limitations

- **Content coverage** — the bot only knows what exists in the 10 allowed
  tables. Topics without published content get a safe "unavailable" response.
- **Phrasing sensitivity** — retrieval quality can vary with how a question is
  worded; some phrasings retrieve the right content more reliably than others.
- **Rate limiting is per-instance** — it is not a global/distributed limit.
- **Reranker scores are relative** — reranker scores depend on the candidate
  batch, so an absolute score threshold is a coarse signal rather than a strict
  relevance measure.
- **No web browsing** — out-of-date or external information is never fetched.

---

## Local development

```bash
cd chatbot
npm install

npm run typecheck   # TypeScript check
npm test            # unit tests (mocked; no production calls)
npm run build       # tsc --noEmit

npm run dev         # local Wrangler dev server
npm run deploy      # deploy the Worker
```

Tests use mocked bindings and never touch production data.
