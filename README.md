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
| Email (Resend) | [docs/email.md](docs/email.md) |
| Content APIs | [docs/content-api.md](docs/content-api.md) |
| Stripe payments | [docs/payments.md](docs/payments.md) |

## Quick start

```bash
npm install
cp .env.example .env
# Edit .env: AUTH_SECRET, AUTH_URL, ADMIN_*, RESEND_*, STRIPE_*

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
