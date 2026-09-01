# QTO ERP Web

Next.js marketing site and admin panel deployed on **Cloudflare Workers** (OpenNext + D1 + R2).

## Documentation

| Topic | Doc |
|-------|-----|
| Database (Drizzle + D1) | [docs/database.md](docs/database.md) |
| Media storage (R2) | [docs/storage.md](docs/storage.md) |
| Deployment (Workers, CI/CD) | [docs/deployment-cloudflare.md](docs/deployment-cloudflare.md) |
| E2E testing checklist | [docs/testing-cloudflare.md](docs/testing-cloudflare.md) |
| Admin panel | [docs/admin.md](docs/admin.md) |
| Email (Cloudflare Email Sending) | [docs/email.md](docs/email.md) |
| Content APIs | [docs/content-api.md](docs/content-api.md) |
| Stripe payments | [docs/payments.md](docs/payments.md) |

## Quick start

```bash
npm install
cp .env.example .env
# Edit .env: JWT_ACCESS_SECRET, JWT_REFRESH_PEPPER, AUTH_URL, ADMIN_*, EMAIL_FROM, ADMIN_NOTIFICATION_EMAIL, STRIPE_*
# For transactional email via Cloudflare, prefer: npm run dev:workers (EMAIL binding)

# For wrangler dev (dev:workers / preview) — create .dev.vars (gitignored) with the same
# secrets plus NEXTJS_ENV=development. Use AUTH_URL=http://localhost:8787 for dev:workers.

npm run db:migrate:local
npm run db:seed
npm run dev                    # fast UI/API on :3000 (D1 only)
# npm run dev:workers          # full bindings on :8787 (D1 + R2 + ISR)
```

Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login) (or `:8787` when using `dev:workers`).

Optional: `npm run stripe:check` to verify Stripe price IDs.

## Development commands

| Script | Port | Use when |
|--------|------|----------|
| `npm run dev` | 3000 | Daily UI/API work (D1 via `initOpenNextCloudflareForDev`) |
| `npm run dev:workers` | 8787 | Media uploads, ISR, full production binding parity |
| `npm run preview` | 8787 | One-shot smoke after OpenNext build |

## Deploy

Production and staging deploy via Jenkins (`main` → production, `staging` → staging) or manually:

```bash
npm run deploy:staging   # staging Worker
npm run deploy           # production Worker
```

See [docs/deployment-cloudflare.md](docs/deployment-cloudflare.md) for secrets, migrations, and DNS cutover.

### Runtime environment (deployed Workers)

The deployed Worker reads these at request time. Non-secrets live in `wrangler.jsonc` `vars`
(per env); secrets are set with `wrangler secret put <NAME> [--env staging]` and must **not** be
kept as plaintext build variables.

| Variable | Where | Notes |
|----------|-------|-------|
| `AUTH_URL` | `wrangler.jsonc` vars | Absolute site base (also used for sitemap URLs) |
| `EMAIL_FROM` | `wrangler.jsonc` vars | `QTO ERP <noreply@qtoerp.com>` |
| `ADMIN_NOTIFICATION_EMAIL` | `wrangler.jsonc` vars | |
| `STRIPE_PRICE_{STARTER,GROWTH}_{MONTHLY,YEARLY}` | `wrangler.jsonc` vars | Price IDs (`price_…`) |
| `JWT_ACCESS_SECRET` | Worker secret | `openssl rand -base64 32` |
| `JWT_REFRESH_PEPPER` | Worker secret | `openssl rand -base64 32` |
| `STRIPE_SECRET_KEY` | Worker secret | Required for checkout routes |
| `STRIPE_WEBHOOK_SECRET` | Worker secret | Required for `/api/webhooks/stripe` |
| `RESEND_API_KEY` | Worker secret | Only if `EMAIL_PROVIDER=resend` (legacy fallback) |
