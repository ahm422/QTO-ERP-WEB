# FAQ & glossary

## Frequently asked questions

**I edited something but the website hasn't changed.**
Give it a minute and refresh the public page (Ctrl/Cmd + Shift + R for a hard refresh). Also
check you clicked **Save** on the right tab, and that the item's **Published** switch is on.

**I deleted something by accident.**
Deletes are permanent from the admin panel. Contact your developer — recent content can
sometimes be restored from a database backup. In future, use the **Published** switch to
hide things instead of deleting.

**Someone didn't get the demo confirmation / invite email.**
Ask them to check spam. Invite/reset links expire after **one hour** — send a new one.
If emails are failing generally, your developer needs to check the email service.

**Can customers log in to this website?**
No. This is the marketing site only. There are no customer accounts here — only staff
accounts for the admin panel.

**How do I add a new module or solution page?**
**Modules → New** (or **Solutions → New**), give it a name and a URL slug, then fill in the
tabs. See [Managing content](./managing-content.md).

**What's the difference between a "module" and a "solution"?**
A **module** is one tool in the product (Attendance, HR, Finance…). A **solution** is the
product described for a type of customer (HR teams, call centres, construction…). They are
separate page types with separate editors.

**Who can add staff accounts?**
Only a **Super Admin**, on the **Users** screen.

**Is there a staging/test version of the site?**
Yes — a separate test copy exists at a `workers.dev` address for your developer to try
changes before they go live. Ask them for the link if you need it.

**How do I get a video of the walkthrough?**
Record your screen while clicking through the site and the admin panel (any screen-recording
tool). Keep it short and narrate what you're doing. Store it alongside this documentation.

---

## Glossary

| Term | Plain meaning |
|------|---------------|
| **Admin panel** | The private, password-protected control area at `/admin`. |
| **Public site** | The pages your customers see at your normal web address. |
| **Module** | One tool within QTO ERP (Attendance, HR, Project Management, CRM, Salary, Finance). Each has its own page. |
| **Solution** | The product presented for a specific audience/industry. Its own page type. |
| **CMS** | "Content Management System" — the fact that your team can edit the site's text and images without a developer. |
| **Lead** | A demo request or contact enquiry from a potential customer. |
| **Draft / Published** | Draft = saved but hidden from the public. Published = live. |
| **Slug** | The end part of a page's web address, e.g. `attendance` in `/erp/attendance`. Lowercase, words joined by hyphens. |
| **Hero** | The large banner at the top of a page (headline + supporting text + buttons). |
| **CTA** | "Call to action" — a prompt with a button, e.g. "Book a demo". |
| **FAQ** | "Frequently asked questions" — an expandable question-and-answer list. |
| **SEO title / description** | The title and summary search engines like Google show for the page. |
| **Sort order** | The position of an item in a list on the public site; usually set by dragging. |
| **Cloudflare** | The company whose network hosts the website, database, files, and email. |
| **D1 / database** | Where all your editable content and leads are stored. |
| **R2 / storage** | Where uploaded images and videos are kept. |
| **Deployment** | Publishing a new version of the website's code (a developer task; content edits don't need it). |
| **Staging** | A private test copy of the site used to check changes before they go live. |
| **Super Admin / Admin / Editor** | The three staff permission levels, from most to least access. |
