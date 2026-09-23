# Admin panel guide

The admin panel is the private control room for the website. The public cannot see it.

## Signing in

1. Go to **`/admin/login`** (add `/admin/login` to your website address).
   *[Screenshot: login screen]*
2. Enter your email and password. Your first Super Admin account is set up during
   installation; everyone else is invited by email (see
   [Managing staff users](./managing-leads-and-users.md#staff-users)).
3. You stay signed in for a while and are quietly kept signed in as you work. If you've been
   away a long time you may be asked to log in again.

**Forgot your password?** Use **`/admin/forgot-password`**. You'll get an email with a link
to set a new one. The link expires after **one hour**.

## The layout

*[Screenshot: admin dashboard with sidebar]*

- **Left sidebar** — the menu, grouped by area (Leads, Website content, Pages,
  Administration). On a phone or small screen the sidebar collapses into a menu button.
- **Main area** — the current screen (a list, a form, or the dashboard).
- **Top of most screens** — a title, a short description, and any "New / Add" button.

## The dashboard (`/admin`)

The first screen after login. It shows at-a-glance counts (leads, demo requests, blog
posts), the most recent demo requests, and quick links to common actions.

## What's in the menu

| Menu item | What it's for |
|-----------|---------------|
| **Demo requests** | People who asked for a demo — update status, reply by email |
| **Contact inquiries** | People who used the contact form — update status, reply by email |
| **Contact** | Edit the Contact page (support cards, contact methods, form options) |
| **Modules** | The six ERP module pages — full editing |
| **Solutions** | The audience/industry solution pages — full editing |
| **Blog** | Write, edit, publish, and delete blog posts |
| **Page heroes** | The top banner (eyebrow, title, subtitle) for Blog, About and Contact |
| **About** | The About page — Hero, Story, Values, and closing CTA tabs |
| **Demo videos** | Upload and publish videos used on module pages |
| **Demo page** | The "Book a demo" page — hero, process steps, form options |
| **Home hero** | The home page's main headline and the rotating module graphic |
| **Trusted logos** | The "Trusted by" logo row on the home page |
| **Home stats** | The statistics strip on the home page |
| **Built for** | The "Built for" audience cards on the home page |
| **Industry domains** | The "Connected ecosystem" list on the home page |
| **FAQs** | Shared FAQ lists for the Home and Contact pages |
| **Home CTA** | The closing call-to-action banner on the home page |
| **Footer** | The site-wide footer: blurb, link columns, newsletter text |
| **Site settings** | Global settings such as the logo and header button *(Admin/Super Admin only)* |
| **Nav resources** | The links and resources shown in the site navigation *(Admin/Super Admin only)* |
| **Users** | Invite and manage staff accounts *(Super Admin only)* |
| **Profile** | Your own name, password, and active sign-ins |

## How editing works (the pattern)

Most screens follow the same rhythm:

1. Open the screen from the menu.
2. For **lists** (blog, logos, FAQs, modules…): you see all items. Click one to edit it, use
   **New / Add** to create one, and use the delete control to remove one. Many lists let you
   **drag items to reorder** them, and have a **Published** switch — turn it off to hide an
   item from the public site without deleting it.
3. For **single blocks** (home hero, footer, About story…): you see one form. Change the
   fields and **Save**.
4. Changes go live on the public site automatically, usually within a short time. Refresh
   the public page to confirm.

## Permission levels

| You are a… | You can… | You cannot… |
|------------|----------|-------------|
| **Super Admin** | Everything, including the **Users** screen | — |
| **Admin** | Edit all content, settings, leads | Add or remove staff accounts |
| **Editor** | Create and edit content | Delete content, change Site settings / Nav resources, manage staff |

If a control is missing for you, your role doesn't allow that action.

## Signing out

Use the sign-out control (in the sidebar or your profile menu). For shared computers, always
sign out when you finish.
