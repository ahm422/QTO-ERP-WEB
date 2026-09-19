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

Public frontend integration is done: the Next.js marketing site talks to this
Worker only through a same-origin `POST /api/chat` route, never directly from
the browser. See [`../docs/technical/architecture.md`](../docs/technical/architecture.md)
and [`../docs/technical/api-reference.md`](../docs/technical/api-reference.md).

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

- **Caller auth** — `POST /chat` requires header `X-Chatbot-Proxy-Secret` to
  match the `CHATBOT_PROXY_SECRET` Worker secret (constant-time compare);
  missing/wrong → `401` before any AI/Vectorize/D1 call. No CORS headers are
  set, so the browser cannot call this Worker directly — only the Next.js
  site's same-origin `POST /api/chat` route holds the secret.
- **Admin auth** — `POST /index` requires `CHATBOT_ADMIN_TOKEN` (constant-time
  compare); missing/wrong → `401`, unset secret → `503`.
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
- Deleted sources are pruned: after each run the indexer diffs the current
  per-source chunk counts against a KV-backed manifest (see below) and deletes
  the vectors of sources that no longer exist (or shrank). Vectors are never
  deleted by the chat endpoint.

---

## Keeping the index in sync (dynamic updates)

D1 stays the live source of truth and the Vectorize index is refreshed
automatically:

| Trigger | How | Command |
|---|---|---|
| Cron | `scheduled` handler (`src/index.ts`), scheduled by `triggers.crons` in `wrangler.jsonc` (daily 02:00 UTC) | `runReindex(env, { prune: true })` |
| Manual | `POST /index`, protected by `CHATBOT_ADMIN_TOKEN` | `runReindex(env, <body>)` |

`runReindex` (`src/rag/reindex.ts`):

1. **Upserts** new/changed rows via the incremental indexer.
2. **Prunes** vectors whose source row was deleted (or shrank), by diffing the
   current per-source chunk counts against the manifest stored in the
   `CHATBOT_SYNC_STATE` KV namespace. If that binding is absent, pruning is
   skipped (upserts still run) and the response reports `pruneSkippedReason`.

So **add / edit / delete a row in D1 and it reaches the chatbot on the next
cron run, or immediately via `POST /index`.** Deleted rows stop being served at
answer time even before a prune, because `resolveSources` drops sources that no
longer exist.

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
  -H "X-Chatbot-Proxy-Secret: <secret>" \
  -d '{"message":"What modules does QTO ERP provide?"}'
```

**Caller auth**: when `CHATBOT_PROXY_SECRET` is set (required in every deployed
environment), `POST /chat` requires header `X-Chatbot-Proxy-Secret: <secret>`;
a missing/wrong value returns `401 { "error": "Unauthorized" }` before any
AI/Vectorize/D1 call. This Worker is never called directly from a browser —
the only intended caller is the Next.js site's same-origin `POST /api/chat`
route (`src/app/api/chat/route.ts` in the web app), which holds the shared
secret as a Worker secret and forwards the visitor's IP so this Worker's
per-IP rate limiting still keys per client. See
[`../docs/technical/architecture.md`](../docs/technical/architecture.md) for
the full request path.

### `POST /index`

Operational endpoint that rebuilds the index on demand. Requires the admin
token (`Authorization: Bearer <CHATBOT_ADMIN_TOKEN>` or
`X-Chatbot-Admin-Token: <token>`); missing token → `401`, unset secret → `503`.

Body (all fields optional; default is a full non-dry-run reindex with prune):

```json
{ "tables": ["faqs", "pricing_plans"], "dryRun": true, "prune": true }
```

Example with curl:

```bash
curl -s -X POST https://qto-erp-chatbot.your-subdomain.workers.dev/index \
  -H "authorization: Bearer $CHATBOT_ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"dryRun":true}'
```

Response (trimmed):

```json
{
  "dryRun": true,
  "prune": true,
  "tables": ["blog_posts", "industry_domains", "..."],
  "vectorsDeleted": 0,
  "vectorsDeletePlanned": 3,
  "manifestWritten": false,
  "index": { "rowsProcessed": 42, "vectorsUpserted": 7, "...": "..." }
}
```

Other routes:

| Method | Path | Behavior |
|---|---|---|
| GET | `/` | Health check: `{"status":"ok","service":"qto-erp-chatbot"}` |
| POST | `/chat` | Grounded Q&A (JSON) |
| POST | `/index` | Protected reindex (cron/manual) |
| any | other paths | `404 Not Found` |

---

## Deployment and configuration notes

- The Worker is `qto-erp-chatbot`; the Vectorize index it uses is
  `qto-erp-chatbot-vectors` (do not recreate it).
- Bindings (`wrangler.jsonc`): `DB` (production D1), `VECTORIZE`, `AI`, and
  `CHATBOT_SYNC_STATE` (KV holding the sync manifest that enables pruning).
- `triggers.crons` runs `scheduled` daily at 02:00 UTC to reindex + prune.
- `CHATBOT_PROXY_SECRET` is a Worker **secret** (`wrangler secret put`, never
  `vars`), required in every deployed environment — see Deploy below.
- `CHATBOT_ADMIN_TOKEN` is a Worker **secret** that protects `POST /index`.
  When unset, `/index` returns `503` (chat still works).
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

To exercise `/chat` locally the way the Next.js BFF will call it, run `npx wrangler dev --port 8788 --ip 127.0.0.1` (see the web app's `docs/technical/local-development.md`) and set a matching `CHATBOT_PROXY_SECRET` in `.dev.vars`.

---

## Deploy

```bash
# Production
cd chatbot
npm run deploy              # -> qto-erp-chatbot
wrangler secret put CHATBOT_PROXY_SECRET
wrangler secret put CHATBOT_ADMIN_TOKEN

# Staging
npm run deploy:staging      # -> qto-erp-chatbot-staging
wrangler secret put CHATBOT_PROXY_SECRET --env staging
wrangler secret put CHATBOT_ADMIN_TOKEN --env staging
```

`CHATBOT_PROXY_SECRET` must be set as a Worker **secret** (never `vars`) in every deployed environment, and must match the value configured as a secret on the Next.js web Worker (`qto-erp-web` / `qto-erp-web-staging`). Deploy the chatbot Worker **before** the web Worker, since the web Worker's `CHATBOT` service binding target must already exist.

Smoke test after deploy:
- `curl https://<worker-url>/` → health JSON
- `curl -X POST https://<worker-url>/chat -H 'content-type: application/json' -d '{"message":"hi"}'` → `401` (no secret sent)
- Authenticated request via the Next.js BFF → `{ answer, sources }`
