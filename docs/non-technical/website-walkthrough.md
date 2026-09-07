# Website walkthrough

Every page a visitor can see, in plain language. Web addresses ("URLs") are shown relative
to your domain — e.g. `/pricing` means `https://yourdomain.com/pricing`.

---

## Home — `/`

*[Screenshot: home page]*

The main landing page. Top to bottom it contains:

1. **Hero** — the big headline, a short supporting sentence, bullet points, and two buttons
   (for example "Book a demo" and "See pricing"). A rotating 3-D graphic of the modules
   sits alongside.
2. **Trusted by** — a row of customer / partner logos.
3. **Statistics strip** — a few headline numbers (e.g. active users, hours saved).
4. **Integrated modules** — cards linking to each module page.
5. **Built for** — cards describing the kinds of teams the product suits.
6. **Connected ecosystem** — industries the product serves, with an item count each.
7. **Common questions** — an expandable FAQ list.
8. **Final call to action** — a closing banner with buttons.
9. **Footer** — company blurb, link columns, newsletter sign-up, legal links.

Everything on this page is editable from the admin panel (see [Managing content](./managing-content.md)).

---

## All applications — `/allApps`

*[Screenshot: all apps]*

A single index page listing every ERP module with a short description and a link to each
module's own page.

---

## Module pages — `/erp/<module>`

*[Screenshot: a module page, e.g. /erp/attendance]*

One page per module. The six modules are:

| Module | Address |
|--------|---------|
| Attendance | `/erp/attendance` |
| HR | `/erp/hrm` |
| Project Management | `/erp/project-management` |
| CRM | `/erp/crms` |
| Salary | `/erp/salary` |
| Finance | `/erp/finance` |

A module page typically has: a hero headline and sub-headline, a highlights/"capabilities"
section, a features section (optionally with a demo video), an "About" section with tabs
(Overview / Problem / Solution / Results), a rollout / how-it-works section, testimonials, an
FAQ, a "see all applications" section, and a closing call to action. All of this is editable
per module.

---

## Solution pages — `/solution/<audience>`

*[Screenshot: a solution page, e.g. /solution/hr-teams]*

The product presented for a specific audience — for example `/solution/hr-teams`,
`/solution/it-companies`, `/solution/call-centers`, `/solution/construction`,
`/solution/education`, `/solution/banking`. Each has a hero, a set of capabilities shown as
tabs, a "recommended modules" section, an FAQ, and a call to action.

---

## Pricing — `/pricing`

*[Screenshot: pricing page]*

- A hero heading and sub-heading.
- Plan cards — **Starter** and **Growth** can be bought online; each shows a monthly and
  yearly price with a toggle. **Enterprise** sends the visitor to the contact page.
- A **"Start free trial"** option on Starter and Growth — a 14-day trial that still asks
  for a card but charges nothing today.
- A **comparison table** — feature-by-feature across Starter / Growth / Enterprise.
- A pricing FAQ.

When a visitor subscribes or starts a trial, they are taken to Stripe's secure checkout
page and then returned to your site. Successful trials land on `/pricing/trial/success`.

---

## Blog — `/blog` and `/blog/<post>`

*[Screenshot: blog list and a single post]*

- `/blog` — a list of published posts with category filters and "popular" / "related"
  groupings.
- `/blog/<post>` — a single article with its cover, formatted text, and images.

Only posts marked **Published** appear. Drafts are private to the admin panel.

---

## About — `/about`

*[Screenshot: about page]*

Company hero, an "Our Story" section with an image and a highlighted callout, and a
"What we stand for" values section, followed by a call to action.

---

## Contact — `/contact`

*[Screenshot: contact page]*

- A contact form (name, email, company, subject, company size, message).
- Contact methods in a side panel and as cards (email, phone, office).
- A support section with response-time expectations.
- A short FAQ.

Submitting the form creates a **contact enquiry** in the admin panel and emails your team.

---

## Book a demo — `/demo`

*[Screenshot: demo page]*

- A hero and a "what to expect" / process section.
- A form (name, email, phone, company phone, country, company, business type).
- Benefits list and a testimonial.

Submitting creates a **demo request** in the admin panel, emails the visitor a confirmation,
and emails your team a notification.

---

## Newsletter sign-up

Appears in the footer on every page. Submitting adds the email to the subscriber list and
sends a welcome email. Signing up with an address that's already subscribed shows an
"already subscribed" message.

---

## What visitors never see

- The admin panel (`/admin/...`).
- Draft blog posts, unpublished modules/solutions, or unpublished list items (hidden logos,
  hidden FAQ entries, etc.).
