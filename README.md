This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database and admin auth

PostgreSQL, Prisma, and admin credentials login (NextAuth) are documented in [docs/database.md](docs/database.md).

Form submissions (demo, contact, newsletter) and transactional email (Resend) are documented in [docs/email.md](docs/email.md).

Marketing content (modules, solutions, blog, pricing comparison) and public read APIs are documented in [docs/content-api.md](docs/content-api.md).

Stripe Checkout for pricing plans (Phase 4) is documented in [docs/payments.md](docs/payments.md).

Demo video object storage (Garage / S3) is documented in [docs/storage.md](docs/storage.md).

The admin panel (Phase 6) is documented in [docs/admin.md](docs/admin.md).

Quick start after Postgres is running:

```bash
cp .env.example .env
# edit .env (DATABASE_URL, AUTH_SECRET, ADMIN_*, RESEND_*, STRIPE_*, GARAGE_*)
npm install
npm run db:migrate
npm run db:seed
npm run stripe:check   # optional: verify Stripe price IDs
```

Admin login: `/admin/login` (seeded user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
