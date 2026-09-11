# QTO ERP Chatbot

A Cloudflare Worker-based RAG chatbot for QTO ERP. The app is intentionally isolated from the main Next.js site. It indexes approved company content from production D1 into Vectorize, and answers questions grounded strictly in that content — latest D1 remains the source of truth.

> This project lives under `chatbot/` and has its own Wrangler configuration, package manifest, and TypeScript setup.

---

## Architecture / Data Flow

```text
PHASE 1 — INDEXING (D1 -> Vectorize)

Production D1 (qto-erp-db-production)
    |
    |  SELECT-only / 10-table allowlist
    v
D1 Reader (env.DB)
    |
    |  extract / normalize
    v
Extractors
    |
    |  chunk (single + multi-chunk)
    v
Chunker
    |
    |  SHA-256 content hash
    v
Hashing
    |
    |  embed (@cf/baai/bge-m3, 1024-dim)
    v
Workers AI (env.AI)
    |
    |  upsert (deterministic ids)
    v
Cloudflare Vectorize (qto-erp-chatbot-vectors)

Incremental/idempotent:
  unchanged chunk hash -> skip BEFORE embedding
  changed chunk hash   -> re-embed, same deterministic id
  deleted source       -> safe deletion helpers (allowlist-guarded)


PHASE 2 — QUERY / CHAT (POST /chat)

User Question
    |
    |  request validation + input guards + scope/injection classifier
    v
Cloudflare Worker
    |
    |  BGE-M3 query embedding (@cf/baai/bge-m3, 1024-dim)
    v
Vectorize Query (fixed index + CHATBOT_VECTORS namespace)
    |
    |  top-K candidates
    v
Latest D1 context (allowlisted, parameterized)
    |
    |  re-chunk + verify hash (fresh / stale / missing)
    v
BGE Reranker (@cf/baai/bge-reranker-base)
    |
    |  top-N relevant chunks
    v
Qwen 3 30B (@cf/qwen/qwen3-30b-a3b-fp8)
    |
    |  context-only answer (<= 500 tokens)
    v
Output Guard (leak detection) + token cap
    |
    v
Grounded Answer (JSON)


PHASE 3 — EVALUATION (offline, isolated from the request path)

src/evaluation/  (never imported by the Worker)
  40-case dataset -> deterministic runner/evaluator
  read-only production retrieval evaluation (BGE-M3 + Vectorize + D1 + reranker)
  reranker cutoff experiment (rerankTopN)
  reranker score-threshold experiment (minRerankScore)


IMPORTANT DATA FLOW NOTES

Production D1 = source of truth.
Vectorize = embeddings + provenance metadata for semantic search, not a DB copy.
Only these 10 tables are ever read/indexed:
  - blog_posts
  - industry_domains
  - about_story
  - demo_page_content
  - contact_support_content
  - erp_modules
  - solutions
  - pricing_plans
  - comparison_features
  - faqs

Sensitive / non-allowlisted tables are never read or indexed.
D1 is read-only from the chatbot's perspective.
The chatbot never writes application data back into D1.
```

### Data Flow Rules

1. Production D1 is the source of truth.
2. The chatbot reads only the 10 explicitly allowlisted tables.
3. User input never becomes a SQL table name, SQL, index name, or namespace.
4. D1 application data is not duplicated into another database.
5. Vectorize stores vector embeddings plus provenance metadata used for retrieval.
6. BGE-M3 converts document chunks and user queries into 1024-dim embeddings.
7. The BGE reranker improves candidate relevance before generation.
8. Qwen generates the final answer only from retrieved, allowlisted context.
9. Retrieved documents are treated as untrusted data, not instructions.
10. If the answer is not supported by the approved data, the chatbot says the information is unavailable rather than hallucinating.

### Current Status

#### VERIFIED — Phase 1 (production)

| Component | Status |
|---|---|
| Production D1 read (SELECT-only) | VERIFIED |
| 10-table allowlist enforcement (rejected before any D1 query) | VERIFIED |
| Extraction / normalization / chunking (single + multi-chunk) | VERIFIED |
| SHA-256 content change detection | VERIFIED |
| BGE-M3 embeddings (1024-dim, `@cf/baai/bge-m3`) | VERIFIED |
| D1 -> BGE-M3 -> Vectorize end-to-end | VERIFIED |
| Deterministic vector IDs (`table:source_id:chunk_index`) | VERIFIED |
| Unchanged-content skipping + changed-content reindexing | VERIFIED |
| Safe deletion helper design (`listSourceVectorIds`, `deleteSourceVectors`, `deleteStaleVectors`) | VERIFIED (mocks only) |
| Full 10-table production indexing (40 rows -> 78 vectors) | VERIFIED |
| Production index consistency (0 missing / 0 stale / 0 orphan) | VERIFIED |

#### VERIFIED — Phase 2 (retrieval + chat, deployed)

| Component | Status |
|---|---|
| Query embedding + Vectorize retrieval (`src/rag/retriever.ts`) | VERIFIED (production) |
| Latest D1 source resolution + hash check (`src/rag/source-resolver.ts`) | VERIFIED (production) |
| BGE reranker (`src/rag/reranker.ts`) | VERIFIED (production) |
| Qwen generation (`src/rag/generator.ts`) | VERIFIED (production, via Workers AI) |
| Secure `POST /chat` (`src/chat/handler.ts`) | VERIFIED (deployed) |
| Input guards + scope/injection classifier | VERIFIED (rejects before AI/Vectorize/D1) |
| Output leak guard + 500-token cap | VERIFIED |
| Empty Qwen generation -> safe unanswered (no 500) | VERIFIED |
| Rate limiting (`src/chat/rate-limit.ts`) | IMPLEMENTED (per-isolate only — **not** a global guarantee) |

Deployed Worker: `qto-erp-chatbot` (automatically built from `feature/Chatbot`).

#### IMPLEMENTED — Phase 3 (evaluation, offline)

| Component | Status |
|---|---|
| 40-case evaluation dataset + deterministic runner/evaluator (`src/evaluation/`) | IMPLEMENTED |
| Read-only production retrieval evaluation (BGE-M3/Vectorize/D1/reranker, no Qwen) | IMPLEMENTED + RUN |
| Reranker cutoff experiment (`rerankTopN` 5/8/10) | IMPLEMENTED + RUN |
| Reranker score-threshold experiment (`minRerankScore` 0.10/0.05/0.01) | IMPLEMENTED + RUN |

#### NOT YET COMPLETED

| Component | Status |
|---|---|
| Applying retrieval-tuning recommendations to production | NOT YET COMPLETED (evaluation only) |
| Distributed/global rate limiting (Rate Limiting binding / Durable Object) | NOT YET COMPLETED |
| Production scheduled / incremental sync | NOT YET COMPLETED |
| Admin-authenticated indexing endpoint | NOT YET COMPLETED |
| Public frontend integration | NOT YET COMPLETED |

---

## Endpoints

| Method | Path | Behavior |
|---|---|---|
| GET | `/` | Health: `{ "status": "ok", "service": "qto-erp-chatbot" }` |
| POST | `/chat` | Grounded Q&A (JSON). See below. |
| * | anything else | `404 Not Found` |

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

The response never includes embeddings, internal prompts, similarity internals, schema, infrastructure details, secrets, or guardrail implementation details.

---

## Security model

- **Input**: `application/json` only; malformed requests rejected; max **2000** chars; whitespace-normalized; abuse patterns rejected.
- **Scope**: company/ERP scope enforced; prompt-injection and political/current-news requests rejected **before** any AI/Vectorize/D1 call.
- **Retrieved content**: treated as untrusted **DATA**; the system prompt forbids following instructions found inside documents.
- **Retrieval**: fixed Vectorize index + `CHATBOT_VECTORS` namespace from config — never user-supplied; candidates with non-allowlisted `source_table` are dropped without a D1 query.
- **D1**: only the 10 allowlisted tables; parameterized queries (`.bind(...)`); no user-controlled identifiers or SQL.
- **Output**: leak detection (`guardOutput`) and a hard **500-token** cap; generic errors only (no stack traces/prompts/secrets).
- **Rate limiting**: fixed-window, in-memory, per-isolate. Configurable via `CHATBOT_RATE_LIMIT_PER_MINUTE`. This does **not** provide global/distributed guarantees — use Cloudflare's Rate Limiting binding or a Durable Object for that.
- **Model prompts** (system + guardrail internals) are never returned to callers.

---

## Retrieval evaluation (Phase 3)

The evaluation harness lives in `src/evaluation/` and is **isolated from the production request path** — the Worker never imports it. It reuses the existing production retrieval functions (`retrieveCandidates`, `resolveSources`, `rerankCandidates`) so measurements reflect real behavior.

- **Dataset**: 40 cases across overview, modules, solutions, pricing, faqs, comparison, public-sector, boundary, unsupported, and security categories. All 10 allowlisted tables are represented (tables without published content are marked via `coversTable`, not fabricated).
- **Runner/evaluator**: deterministic, offline; `npm test` never calls Cloudflare. Security/out-of-scope cases are skipped and make **zero** downstream calls.
- **Read-only production runtimes/CLIs**: BGE-M3 embeddings, Vectorize queries, D1 SELECTs, and BGE reranking only. **No Qwen, no D1 writes, no Vectorize mutations.**

Measured baseline (production defaults `topK=15`, `rerankTopN=5`, `minRerankScore=0.1`, `minVectorizeScore=0.15`): **23/29 retrieval cases passed**; 0 D1-resolution failures; 1 Vectorize recall miss; 5 reranker-related misses.

Experiments (evaluation only — **production defaults were NOT changed**):

| Experiment | Result | Notes |
|---|---|---|
| `rerankTopN` 5 / 8 / 10 | 23/29 / **25/29** / 25/29 | `8` is the smallest tested improvement |
| `minRerankScore` 0.10 / 0.05 / 0.01 (at `rerankTopN=8`) | 25/29 / **26/29** / 27/29 | lower thresholds admit more extra tables (avg extra 0.93 -> 1.07 -> 1.45) |

Recommendation recorded for a **future controlled change** (not applied): `rerankTopN=8` with `minRerankScore=0.05`. One case (`bnd-2`) and one Vectorize miss (`ps-4`) remain regardless.

Evaluation CLIs (read-only, require a Wrangler OAuth token; never print content):
```bash
node --experimental-strip-types src/evaluation/retrieval-cli.ts
node --experimental-strip-types src/evaluation/rerank-experiment-cli.ts
node --experimental-strip-types src/evaluation/threshold-experiment-cli.ts
```

---

## Folder Structure

```text
chatbot/
├── README.md
├── package.json
├── tsconfig.json
├── wrangler.jsonc
├── worker-configuration.d.ts
├── src/
│   ├── index.ts                 # Worker entrypoint + routing (/ , /chat)
│   ├── chat/
│   │   ├── handler.ts           # secure POST /chat orchestration
│   │   └── rate-limit.ts        # per-isolate fixed-window limiter
│   ├── config/
│   │   └── index.ts             # env-driven configuration + defaults
│   ├── evaluation/              # Phase 3 (never imported by the Worker)
│   │   ├── types.ts
│   │   ├── dataset.ts           # 40-case evaluation dataset
│   │   ├── evaluator.ts         # pure pass/fail evaluator
│   │   ├── runner.ts            # deterministic local + injectable runtime
│   │   ├── retrieval.ts         # retrieval metrics + stage-aware scoring
│   │   ├── production-runtime.ts# read-only Cloudflare env bridge (SELECT/query only)
│   │   ├── retrieval-cli.ts
│   │   ├── rerank-experiment.ts
│   │   ├── rerank-experiment-cli.ts
│   │   ├── threshold-experiment.ts
│   │   └── threshold-experiment-cli.ts
│   ├── lib/
│   │   ├── chunker.ts
│   │   ├── d1_reader.ts
│   │   └── hashing.ts
│   ├── rag/
│   │   ├── embedding.ts         # BGE-M3 (Phase 1 + query embeddings)
│   │   ├── extractors.ts
│   │   ├── indexer.ts           # Phase 1 indexing
│   │   ├── retriever.ts         # Phase 2 retrieval
│   │   ├── reranker.ts          # Phase 2 BGE reranker
│   │   ├── source-resolver.ts   # Phase 2 latest D1 context
│   │   ├── generator.ts         # Phase 2 Qwen generation
│   │   └── vectorize.ts
│   ├── security/
│   │   ├── classifier.ts        # scope + prompt-injection + political detection
│   │   ├── input-guards.ts
│   │   └── output-guard.ts      # leak detection
│   ├── test/
│   │   ├── allowlist.test.ts
│   │   ├── phase1-unit.test.ts
│   │   ├── phase1-incremental.test.ts
│   │   ├── phase2-retriever.test.ts
│   │   ├── phase2-chat.test.ts
│   │   ├── phase2-generator.test.ts
│   │   ├── phase2-classifier.test.ts
│   │   ├── phase2-reranker.test.ts
│   │   ├── phase2-mocks.ts                  # shared test fakes (not a test)
│   │   ├── phase3-evaluation.test.ts
│   │   ├── phase3-retrieval-evaluation.test.ts
│   │   ├── phase3-rerank-experiment.test.ts
│   │   └── phase3-threshold-experiment.test.ts
│   └── types/
│       ├── allowlist.ts
│       ├── core.ts
│       └── env.ts
```

### Key source files

- `src/index.ts` — Worker entrypoint; routes `/` (health) and `/chat`; everything else 404.
- `src/chat/handler.ts` — secure `/chat` flow: validation -> guards -> classifier -> retrieval -> rerank -> generation -> output guard.
- `src/rag/indexer.ts` — Phase 1 indexing orchestration.
- `src/rag/retriever.ts` / `reranker.ts` / `source-resolver.ts` / `generator.ts` — Phase 2 pipeline.
- `src/rag/vectorize.ts` — Vectorize upsert/lookup/deletion wrappers.
- `src/rag/embedding.ts` — Workers AI BGE-M3 embedding pipeline.
- `src/types/allowlist.ts` — strict allowlist for D1 tables.
- `src/security/` — input validation, scope/injection/political classification, output leak guard.
- `src/evaluation/` — offline Phase 3 evaluation harness (never imported by the Worker).
- `src/test/` — Phase 1 + Phase 2 + Phase 3 automated checks (all mocked; no production calls).

---

## Models & limits

| Purpose | Model / value |
|---|---|
| Embeddings | `@cf/baai/bge-m3` (1024 dimensions) |
| Reranker | `@cf/baai/bge-reranker-base` |
| Generation | `@cf/qwen/qwen3-30b-a3b-fp8` |
| Max input | 2000 characters |
| Max output | 500 tokens |
| Retrieval top-K | configurable (`CHATBOT_RAG_TOP_K`, default 15) |
| Rerank top-N | configurable (`CHATBOT_RERANK_TOP_N`, default 5) |
| Min rerank score | configurable (`CHATBOT_MIN_RERANK_SCORE`, default 0.1) |
| Min Vectorize score | configurable (`CHATBOT_MIN_VECTORIZE_SCORE`, default 0.15) |
| Rate limit | configurable (`CHATBOT_RATE_LIMIT_PER_MINUTE`, default 30) |

All tunables live in `src/config/index.ts` and can be overridden via Wrangler `vars`. Evaluation recommendations (e.g. `rerankTopN=8`, `minRerankScore=0.05`) are **not** applied to production defaults.

---

## Local development

```bash
cd chatbot
npm install
npm run typecheck
npm run build     # tsc --noEmit
npm test          # node --experimental-strip-types --test src/test/**/*.test.ts
npm run dev       # wrangler dev (local)
```

### Test status

- `npm run typecheck` — PASS
- `npm run build` — PASS
- `npm test` — 126 tests passing (Phase 1 + Phase 2 + Phase 3, all mocked; no production bindings touched)

---

## Cloudflare resources

| Binding | Resource |
|---|---|
| `DB` | D1 `qto-erp-db-production` (read-only from the chatbot) |
| `VECTORIZE` | Vectorize index `qto-erp-chatbot-vectors` (1024-dim, cosine, 78 vectors) |
| `AI` | Workers AI (BGE-M3, BGE reranker, Qwen) |

Namespace key: `CHATBOT_VECTORS`.

> Do not recreate the index or reindex production without explicit approval. Production indexing is idempotent and incremental (unchanged content is skipped before embedding).
