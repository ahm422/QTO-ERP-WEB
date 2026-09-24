# QTO ERP Web

QTO ERP Web is the public website and content management system for QTO ERP. It runs on Next.js and Cloudflare Workers. Visitors can explore ERP modules and solutions, read articles, request a demo, contact the team, subscribe to updates, and ask a company-specific chatbot. Staff manage published content and incoming requests from a protected admin dashboard.

This repository contains two deployable applications:

| Application | Location | Purpose |
| --- | --- | --- |
| Web app | Repository root | Next.js website, admin dashboard, and HTTP API, deployed as `qto-erp-web` |
| Chatbot | [`chatbot/`](chatbot/README.md) | Separate Worker that indexes approved content and answers questions using retrieval-augmented generation (RAG) |

## Features

- **Public website:** home page, ERP module directory and detail pages, solutions, blog, about, contact, and demo request pages.
- **Content management:** editors for page copy, modules, solutions, articles, FAQs, chatbot knowledge, navigation, footer, images, and demo videos. Published content comes from D1, with code defaults for many page sections.
- **Lead management:** demo requests, contact inquiries, and newsletter subscriptions, with transactional emails and dashboard workflows.
- **Staff access:** password login, password reset, session management, and role-based permissions for `SUPER_ADMIN`, `ADMIN`, and `EDITOR`.
- **Chatbot:** a same-origin `/api/chat` endpoint proxies requests to an isolated chatbot Worker. It retrieves approved D1 content through Vectorize and Workers AI, and supports JSON and opt-in NDJSON streaming responses.
- **Media and caching:** R2 stores uploaded media and the OpenNext incremental cache; detail pages use incremental static regeneration (ISR) with on-demand invalidation.

Self-service checkout has been removed. `/pricing` redirects to `/contact`; sales inquiries use the contact and demo forms. See [payments.md](docs/technical/payments.md).

## Technology

| Area | Implementation |
| --- | --- |
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Radix UI, Framer Motion |
| Hosting | Cloudflare Workers through `@opennextjs/cloudflare` |
| Data | Cloudflare D1 (SQLite), Drizzle ORM and migrations |
| Media and cache | Cloudflare R2, OpenNext ISR cache, D1 tag cache, Durable Object queue |
| Authentication | JWT access tokens, D1-backed refresh sessions, bcrypt password hashes, server-side capability checks |
| Email | Cloudflare Email Sending and React Email templates; Resend remains an explicit legacy fallback |
| Chatbot | Separate Cloudflare Worker, Vectorize, Workers AI, and a KV sync manifest |
| Tooling | npm, Wrangler, ESLint, `tsx`, Jenkins, SonarQube |

Exact package versions are in [`package.json`](package.json) and [`chatbot/package.json`](chatbot/package.json).

## Architecture

```text
Browser
  ├─ Public pages and /api/* ──> Next.js / OpenNext Worker ──> D1, R2, Email
  ├─ /admin ────────────────> Same Worker, protected admin APIs
  └─ /api/chat ─────────────> Same Worker ──> Chatbot Worker
                                               ├─ D1: approved source content
                                               ├─ Vectorize: retrieval index
                                               ├─ Workers AI: embeddings, reranking, answers
                                               └─ KV: index sync state
```

The browser talks to the chatbot through the web app's `/api/chat` route. The web Worker authenticates to the chatbot Worker with a shared secret. Admin content changes can request a chatbot reindex, and the chatbot also reindexes on its daily cron schedule. The web app's API routes run in the same Worker as its pages; the chatbot has its own package, configuration, tests, and deployment.

For request flows and binding details, read the [architecture guide](docs/technical/architecture.md) and [chatbot guide](chatbot/README.md).

## Repository map

| Path | Contents |
| --- | --- |
| `src/app/(site)/` | Public App Router pages |
| [`src/app/admin/`](src/app/admin/) | Login and admin dashboard screens |
| [`src/app/api/`](src/app/api/) | Public, auth, admin, media, lead, and chat route handlers |
| [`src/components/`](src/components/) | Shared UI and admin components |
| [`src/db/`](src/db/) and [`drizzle/migrations/`](drizzle/migrations/) | Database schema and SQL migrations |
| [`src/lib/`](src/lib/) and [`src/emails/`](src/emails/) | Business logic, validation, content defaults, auth, and email templates |
| [`chatbot/`](chatbot/README.md) | RAG Worker and its own setup instructions |
| [`scripts/`](scripts/) | Seeding, admin creation, and verification scripts |
| [`ops/ci/`](ops/ci/) | Jenkins deployment pipeline and SonarQube settings |
| [`docs/`](docs/README.md) | Technical and staff-facing guides |

See the [full project structure](docs/technical/project-structure.md) for where to make common changes.

## Local setup

### Prerequisites

- Node.js 20+ and npm
- A Cloudflare account and Wrangler access for Workers development, remote resources, or deployment
- `openssl` to generate local JWT secrets

### Run the web app

```bash
npm ci
cp .env.example .env
```

Edit `.env` with at least `JWT_ACCESS_SECRET`, `JWT_REFRESH_PEPPER`, `AUTH_URL=http://localhost:3000`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `EMAIL_FROM`, and `ADMIN_NOTIFICATION_EMAIL`. Generate each JWT secret with `openssl rand -base64 32`. Keep real passwords and secrets out of Git. The [environment reference](docs/technical/environment-variables.md) explains every value and where it belongs.

```bash
npm run db:migrate:local
npm run db:seed
npm run dev
```

Open <http://localhost:3000> and sign in at <http://localhost:3000/admin/login> with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` set for seeding. Local D1 state persists under `.wrangler/state/`.

`npm run dev` is the fast Next.js development path on port `3000`. For the full Worker bindings, create a gitignored `.dev.vars` with the corresponding secrets, `NEXTJS_ENV=development`, and `AUTH_URL=http://localhost:8787`, then run `npm run dev:workers` on port `8787`. Use that mode for upload, email-binding, and ISR behavior. See [local development](docs/technical/local-development.md) for the differences.

### Run the chatbot locally (optional)

The web app can start without the chatbot, but `/api/chat` needs a running chatbot Worker. For isolated development, use the chatbot's local config, which shares the web app's local D1 state while using a separate development Vectorize index. Workers AI still runs remotely.

```bash
cd chatbot
npm ci
npx wrangler dev --config wrangler.dev.jsonc --port 8788 --ip 127.0.0.1 \
  --persist-to ../.wrangler/state
```

Set matching `CHATBOT_PROXY_SECRET` values in the web app's `.env` and `chatbot/.dev.vars`, and set `CHATBOT_URL=http://127.0.0.1:8788` in `.env`. Set `CHATBOT_ADMIN_TOKEN` in `chatbot/.dev.vars` for protected manual indexing. Its [README](chatbot/README.md) covers local indexing, secrets, tests, and the production versus development Wrangler configs.

## Configuration

| Context | Configuration |
| --- | --- |
| Web app, plain `npm run dev` and scripts | `.env` copied from [`.env.example`](.env.example) |
| Web app, local Wrangler | Gitignored `.dev.vars` |
| Chatbot, local Wrangler | Gitignored `chatbot/.dev.vars` and [`chatbot/wrangler.dev.jsonc`](chatbot/wrangler.dev.jsonc) |
| Deployed Workers | Non-secret `vars` and bindings in [`wrangler.jsonc`](wrangler.jsonc) / [`chatbot/wrangler.jsonc`](chatbot/wrangler.jsonc); secrets set through Wrangler |

The web Worker needs `DB`, `MEDIA_BUCKET`, `EMAIL`, cache bindings, and the `CHATBOT` service binding. The chatbot Worker needs `DB`, `VECTORIZE`, `AI`, and `CHATBOT_SYNC_STATE`. `CHATBOT_PROXY_SECRET` must match on both deployed Workers; `CHATBOT_ADMIN_TOKEN` protects the chatbot's `/index` endpoint and is also used by the web Worker to trigger reindexing. Details: [environment variables](docs/technical/environment-variables.md), [deployment](docs/technical/deployment-cloudflare.md), and [chatbot deployment](chatbot/README.md#deploy).

## Common commands

Run these from the repository root unless stated otherwise.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js development on port `3000` |
| `npm run dev:workers` | Build and start the full Worker locally on port `8787` |
| `npm run build` | Produce the OpenNext Worker bundle |
| `npm run preview` | Build and preview the Worker locally |
| `npm run lint` | Lint `src/` |
| `npm run test:unit` | Run web app unit tests |
| `npm run db:generate` | Generate a migration after editing the Drizzle schema |
| `npm run db:migrate:local` | Apply migrations to local D1 |
| `npm run db:seed` | Create the local admin and seed site content |
| `npm run db:create-admin` | Create or reset a local admin |
| `npm run cf:types` | Regenerate Cloudflare binding types after Wrangler config changes |
| `npm run deploy:staging` / `npm run deploy` | Build and deploy the web Worker to staging / production |

From `chatbot/`, run `npm run typecheck`, `npm test`, and `npm run deploy` for that separate Worker. The [local development guide](docs/technical/local-development.md) lists the remaining database and verification scripts.

## API at a glance

| Area | Example routes | Notes |
| --- | --- | --- |
| Public content | `GET /api/modules`, `/api/solutions`, `/api/blog` | Published content for the site |
| Lead intake | `POST /api/demo`, `/api/contact`, `/api/subscribe` | Validated input, D1 storage, email notifications |
| Authentication | `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout` | JWT access token and refresh cookie |
| Admin | `/api/admin/**` | Bearer token plus server-side capability checks |
| Media | `GET /api/media/<key>` | Streams allowed R2 objects |
| Chat | `POST /api/chat` | Proxies JSON or opt-in streamed answers from the chatbot Worker |
| Health | `GET /api/health` | Checks that the web Worker is running |

The complete endpoint list, payloads, error codes, and role matrix are in the [API reference](docs/technical/api-reference.md). The chatbot Worker's `/chat` and protected `/index` endpoints are documented in its [README](chatbot/README.md#api).

## Deployment and checks

[`ops/ci/Jenkinsfile`](ops/ci/Jenkinsfile) deploys the web app from `staging` to the staging Worker and from `main` to production at `qtoerp.com`. Its pipeline runs SonarQube, `npm ci`, lint, D1 migrations, deployment, and HTTP smoke checks. Manual web deploy commands are `npm run deploy:staging` and `npm run deploy`. The chatbot is deployed separately from `chatbot/`; its target Worker must exist before deploying a web Worker that binds to it. The chatbot's staging Wrangler environment currently lacks its own D1, Vectorize, and AI bindings, so [configure those resources](chatbot/README.md#deploy) before relying on staging chat.

Before a release, follow the [Cloudflare deployment guide](docs/technical/deployment-cloudflare.md) and [manual testing checklist](docs/technical/testing-cloudflare.md). Run `npm run lint` and `npm run test:unit` for the web app, and `npm run typecheck && npm test` in `chatbot/`. The [known issues guide](docs/technical/known-issues-and-tech-debt.md) records current product and operational limitations.

## Documentation

| Guide | Audience and scope |
| --- | --- |
| [Documentation index](docs/README.md) | Entry point to all guides |
| [Technical documentation](docs/technical/README.md) | Architecture, database, API, authentication, email, storage, deployment, and troubleshooting |
| [Chatbot documentation](chatbot/README.md) | RAG pipeline, content sources, configuration, indexing, security, and deployment |
| [Staff documentation](docs/non-technical/README.md) | Website walkthrough, admin tasks, content editing, and lead management |
