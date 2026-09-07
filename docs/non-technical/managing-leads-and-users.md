# Managing leads & staff users

## Leads

Two kinds of enquiry arrive from the public website. Both appear in the admin panel **and**
trigger an email to your team's notification inbox.

### Demo requests — `/admin/demo-requests`

Created when someone submits the **Book a demo** form.

*[Screenshot: demo requests list]*

1. New requests show with status **New**. Click one to see the full details (name, email,
   phone, company, country, business type).
2. Change the **status** as you work it:
   - **New** — not yet looked at.
   - **Read** — seen / in progress.
   - **Archived** — closed / no longer active.
3. To respond, use **Reply** — type a message and send. The customer receives it by email
   from your site's address. The exchange is recorded on the request.
4. The person who submitted also automatically received a confirmation email when they filled
   in the form.

### Contact inquiries — `/admin/contact-inquiries`

Created from the **Contact** form. Works exactly like demo requests: same **New / Read /
Archived** statuses and the same **Reply** by email.

### Newsletter subscribers

Collected from the footer sign-up. There is no management screen — the list is stored for
export by a developer if you need it. Someone signing up twice simply gets an "already
subscribed" message.

### Good habits

- Work leads from **New** downward and move them to **Read** so nothing is handled twice.
- **Archive** rather than delete, so you keep the history.
- Reply from the admin panel so the conversation stays attached to the lead.

---

## Staff users

Managed at **`/admin/users`**. **Only a Super Admin sees this screen.**

### The three roles

| Role | Use for | Can | Cannot |
|------|---------|-----|--------|
| **Super Admin** | Owner / site manager | Everything, incl. managing staff | — |
| **Admin** | Marketing / content lead | All content, settings, leads | Add/remove staff |
| **Editor** | Contributor | Create & edit content | Delete content, change Site settings / Nav resources, manage staff |

### Invite someone

1. **Users → Invite.** *[Screenshot: invite form]*
2. Enter their **email**, optionally a **name**, and choose a **role** (default is Editor).
3. They receive an email with a link to set their password. **The link expires after one
   hour** — if it lapses, invite again or ask them to use **Forgot password**.
4. Once they've set a password they sign in at `/admin/login`.

### Change a role or remove access

- **Users → click the person → change role → save.**
- To remove access, **disable** the account. They can no longer sign in, but their history
  (e.g. blog posts they authored) is preserved. Disabling is reversible.

### Password resets

Anyone can reset their own password from **`/admin/forgot-password`**. A Super Admin can also
re-invite a user to trigger a fresh set-password link.

### Security notes for the client

- Give people the **lowest role** that lets them do their job. Add Editors, not Admins, for
  content contributors.
- Keep at least **two Super Admins** so you're never locked out.
- Remove access promptly when someone leaves.
- The notification inbox for leads should be a **shared company inbox**, not one person's
  personal email — ask your developer to confirm what it's currently set to.
