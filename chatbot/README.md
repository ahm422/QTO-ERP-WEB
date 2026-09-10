# QTO ERP Chatbot

A Cloudflare Worker-based RAG chatbot for QTO ERP. The app is intentionally isolated from the main Next.js site and only reads approved production data from D1, then grounds responses from a Vectorize-backed retrieval layer.

> This project lives under `chatbot/` and has its own Wrangler configuration, package manifest, and TypeScript setup.

---

## Architecture / Data Flow

```text
SOURCE DATA / INDEXING FLOW

Production D1 (qto-erp-db-production)
    |
    |  SELECT-only / allowlisted tables
    v
Cloudflare Worker: qto-erp-chatbot
    |
    |  Security / Input Guards
    v
D1 Reader (env.DB)
    |
    |  extract
    v
Extractors
    |
    |  normalize
    v
Normalization
    |
    |  chunk
    v
Chunker
    |
    |  SHA-256 content hash
    v
Hashing
    |
    |  embed
    v
Workers AI / BGE-M3 (env.AI)
    |
    |  1024-dimensional embeddings
    v
Cloudflare Vectorize (qto-erp-chatbot-vectors)
    |
    |  vectors + provenance metadata
    v
Semantic search/index storage


PLANNED / LATER PHASES (QUERY / CHAT FLOW)

User Question
    |
    |  input security / guardrails
    v
Cloudflare Worker
    |
    |  BGE-M3 embedding
    v
Vectorize Query
    |
    |  retrieve candidate chunks
    v
Candidate Chunks
    |
    |  BGE reranker (planned Phase 2)
    v
Relevant Context
    |
    |  Qwen 3 30B (planned Phase 3)
    v
Output Guard
    |
    |  final answer
    v
Grounded Chatbot Answer


IMPORTANT DATA FLOW NOTES

Production D1 = source of truth
Vectorize = embeddings + metadata for semantic search, not a copy of the database
Only these 10 tables are indexed:
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

Sensitive or non-allowlisted tables are never indexed.
D1 is read-only from the chatbot perspective.
The chatbot does not write application data back into D1.
```

### Data Flow Rules

1. Production D1 is the source of truth.
2. The chatbot reads only the 10 explicitly allowlisted tables.
3. User input never becomes a SQL table name or arbitrary SQL.
4. D1 application data is not duplicated into another database.
5. Vectorize stores vector embeddings plus provenance metadata used for retrieval.
6. BGE-M3 converts document chunks and later user queries into embeddings.
7. The future reranker improves candidate relevance.
8. The future Qwen model generates the final answer only from approved/retrieved context.
9. Retrieved documents are treated as untrusted data, not instructions.
10. If the answer is not supported by the approved data, the chatbot should say that the information is unavailable rather than hallucinating.

### Current vs Planned Status

#### VERIFIED (Phase 1)

| Component | Status |
|---|---|
| Production D1 read (SELECT-only) | VERIFIED |
| 10-table allowlist enforcement (rejected before any D1 query) | VERIFIED |
| Extraction/normalization | VERIFIED |
| Chunking (single + multi-chunk) | VERIFIED |
| SHA-256 content change detection | VERIFIED |
| BGE-M3 embeddings (1024-dim, `@cf/baai/bge-m3`) | VERIFIED |
| D1 → BGE-M3 → Vectorize end-to-end | VERIFIED |
| Real FAQ vector verification (`faqs:albjgn6vyxfczeonp5orv7ay:0`, found: true) | VERIFIED |
| Vectorize upsert (mutation-response handling) | VERIFIED |
| Deterministic vector IDs (`table:source_id:chunk_index`) | VERIFIED |
| Unchanged-content skipping (no re-embed, no duplicate) | VERIFIED |
| Changed-content reindexing (new hash, same deterministic ID) | VERIFIED |
| Multi-chunk indexing (per-chunk embedding + full metadata) | VERIFIED |
| Safe deletion helper design (`listSourceVectorIds`, `deleteSourceVectors`, `deleteStaleVectors`) | VERIFIED (mocks only) |

#### NOT YET COMPLETED

| Component | Status |
|---|---|
| Full 10-table production indexing | NOT YET COMPLETED |
| Production scheduled / incremental sync | NOT YET COMPLETED |
| Vectorize retrieval | NOT YET COMPLETED |
| BGE reranker | NOT YET COMPLETED |
| Qwen 3 30B | NOT YET COMPLETED |
| `/chat` endpoint | NOT YET COMPLETED |
| Output guard final integration | NOT YET COMPLETED |
| Public chatbot completion | NOT YET COMPLETED |

> Phase 1 validation is complete: the D1 → BGE-M3 → Vectorize pipeline, a real FAQ
> vector lookup, idempotent skip/reindex, deterministic IDs, multi-chunk indexing,
> allowlist enforcement, and the deletion-helper design are all verified by the
> automated test suite. The full 10-table production dataset has **not** been
> indexed, and the chatbot is **not** production-ready.

---

## Folder Structure

```text
chatbot/
├── README.md
├── package.json
├── tsconfig.json
├── wrangler.jsonc
├── worker-configuration.d.ts
├── node_modules/
├── .wrangler/
├── src/
│   ├── index.ts
│   ├── config/
│   │   └── (environment / app configuration)
│   ├── lib/
│   │   ├── chunker.ts
│   │   ├── d1_reader.ts
│   │   └── hashing.ts
│   ├── rag/
│   │   ├── embedding.ts
│   │   ├── extractors.ts
│   │   ├── indexer.ts
│   │   └── vectorize.ts
│   ├── security/
│   │   ├── classifier.ts
│   │   ├── input-guards.ts
│   │   └── output-guard.ts
│   ├── test/
│   │   ├── phase1-unit.test.ts
│   │   ├── phase1-incremental.test.ts
│   │   └── allowlist.test.ts
│   └── types/
│       ├── allowlist.ts
│       ├── core.ts
│       ├── env.ts
│       └── vector.ts
└── .
```

### Key source files

- `src/index.ts` — Worker entrypoint and local-only development routes
- `src/rag/indexer.ts` — main Phase 1 indexing orchestration
- `src/rag/vectorize.ts` — Vectorize upsert / lookup wrappers
- `src/rag/embedding.ts` — Workers AI embedding pipeline
- `src/types/allowlist.ts` — strict allowlist for D1 tables
- `src/security/` — validation and output-safety logic
- `src/test/` — automated checks for deterministic behavior, allowlist enforcement, and incremental/idempotent indexing (all with mocked bindings)

---

## Core design principles

- Read-only access to production data
- Explicit table allowlisting instead of generic queries
- Deterministic vector IDs for idempotent indexing
- Metadata-aware vector records for provenance and change detection
- Safe, bounded, production-oriented retrieval
- Local-only validation routes for testing and smoke checks

---

## Local development

```bash
cd chatbot
npm install
npm run typecheck
npm test
npm run dev
```

The Worker is designed for local verification without deploying production data or enabling public chat endpoints beyond the local development context.
