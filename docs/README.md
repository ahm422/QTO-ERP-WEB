# QTO ERP Web — Documentation

Next.js marketing website + content-managed admin panel for **QTO ERP**, deployed on
**Cloudflare Workers** (OpenNext + D1 + R2 + Cloudflare Email Sending).

Documentation is split by audience:

| Folder | For | Start here |
|--------|-----|------------|
| [`technical/`](./technical/) | Developers who will maintain, extend, or deploy the app | [`technical/README.md`](./technical/README.md) |
| [`non-technical/`](./non-technical/) | The client and their staff who will run the site day to day | [`non-technical/README.md`](./non-technical/README.md) |

## Quick links

**Technical**

- [Architecture overview](./technical/architecture.md)
- [Project / folder structure](./technical/project-structure.md)
- [Database schema & ERD](./technical/database-schema.md)
- [API reference](./technical/api-reference.md)
- [Environment variables](./technical/environment-variables.md)
- [Third-party services & account ownership](./technical/third-party-services.md)
- [Local development](./technical/local-development.md)
- [Deployment & infra (Cloudflare)](./technical/deployment-cloudflare.md)
- [Known issues & tech debt](./technical/known-issues-and-tech-debt.md)

**Non-technical**

- [What the product does](./non-technical/product-overview.md)
- [Website walkthrough (screen by screen)](./non-technical/website-walkthrough.md)
- [Admin panel guide](./non-technical/admin-guide.md)
- [Managing content](./non-technical/managing-content.md)
- [Managing leads & staff users](./non-technical/managing-leads-and-users.md)
- [FAQ & glossary](./non-technical/faq-and-glossary.md)

## About the `archive/` folder

[`technical/archive/`](./technical/archive/) holds historical planning documents (migration
plans, design-system phase baselines, the retired Coolify deployment notes, and the frozen
hardcoded-copy inventory). They are kept for context but are **not** current operating docs.
