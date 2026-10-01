# QTO ERP Web

Marketing website and content-managed admin panel for **QTO ERP**, built with Next.js and
deployed on **Cloudflare Workers** via OpenNext.

## Features

- Marketing site: ERP modules, solutions, industries, pricing, blog, FAQs, demo requests
- Admin panel (`/admin`) with role-based access: CMS for pages, modules, solutions, blog,
  media library, leads, subscribers and staff users
- Custom JWT access/refresh authentication with invites and password reset
- Transactional email via Cloudflare Email Sending
- Media storage on Cloudflare R2
- RAG chatbot served by a separate Worker (`chatbot/`) using Workers AI, Vectorize, D1 and KV

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · Drizzle ORM · Cloudflare D1 / R2 / KV /
Vectorize / Workers AI · OpenNext for Cloudflare · Stripe

## Project layout

```
src/app/        routes: public site, /admin dashboard, /api handlers
src/components/ UI components
src/db/         Drizzle schema
src/lib/        auth, validation, email, storage, chat proxy helpers
drizzle/        SQL migrations for D1
scripts/        seeding, admin creation, verification scripts
chatbot/        standalone RAG chatbot Worker (see chatbot/README.md)
docs/           user guides for site editors (docs/non-technical/)
```

## Local setup

```bash
npm install
cp .env.example .env
# Fill in JWT_ACCESS_SECRET, JWT_REFRESH_PEPPER, AUTH_URL, ADMIN_EMAIL, ADMIN_PASSWORD, ...
# For `npm run dev:workers`, create .dev.vars (gitignored) with the same secrets.

npm run db:migrate:local
npm run db:seed
npm run dev            # http://localhost:3000
```

Admin login: <http://localhost:3000/admin/login>

| Script | Port | Use when |
|--------|------|----------|
| `npm run dev` | 3000 | Daily UI/API work against local D1 |
| `npm run dev:workers` | 8787 | Full Worker bindings (R2, ISR, email) |
| `npm run preview` | 8787 | Smoke test of the OpenNext build |
| `npm run test:unit` | — | Unit tests |
| `npm run lint` | — | ESLint |

## Deployment

1. Create the Cloudflare resources (D1 databases, R2 bucket, KV namespaces) in your account.
2. Replace the placeholders in `wrangler.jsonc` and `chatbot/wrangler.jsonc`
   (`YOUR_CLOUDFLARE_ACCOUNT_ID`, `YOUR_D1_DATABASE_ID`, `YOUR_KV_NAMESPACE_ID`,
   `your-subdomain.workers.dev`).
3. Set secrets with `wrangler secret put <NAME> [--env staging]`
   (`JWT_ACCESS_SECRET`, `JWT_REFRESH_PEPPER`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `CHATBOT_PROXY_SECRET`, ...).
4. Apply migrations and deploy:

```bash
npm run db:migrate:remote
npm run deploy           # production
npm run deploy:staging   # staging
```

## Documentation

Guides for people running the site day to day are in [`docs/non-technical/`](docs/non-technical/README.md).
