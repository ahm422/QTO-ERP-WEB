# Managing content

Step-by-step tasks for editing the public website from the admin panel. All paths are inside
`/admin`.

> **General tips**
> - After saving, refresh the matching public page to check your change.
> - The **Published** switch hides/shows an item without deleting it. Prefer it over delete.
> - Drag the handle on list rows to change their order on the public site.
> - Deleting is permanent and is only available to Admin / Super Admin.

---

## Write a blog post

1. Go to **Blog → New**. *[Screenshot: blog editor]*
2. Fill in **Title**, **Category**, and (optionally) an **Excerpt** (the short summary shown
   in the blog list).
3. Write the body in the text editor. You can add headings, lists, links, tables, images,
   and videos. To add an image, use the editor's image button — it uploads straight to the
   site.
4. Set **Status**:
   - **Draft** — saved but not public.
   - **Published** — live on `/blog`. If you don't set a date, "published now" is used.
5. Optionally set a **Published date** (for back-dating or scheduling display order) and
   **SEO title / description**.
6. **Save.**

**Edit or delete:** Blog → click the post. Changing a published post updates the live
article. Setting it back to Draft removes it from the public blog but keeps it for you.

---

## Edit a module page (e.g. Attendance)

1. Go to **Modules** and click the module. *[Screenshot: module editor tabs]*
2. The editor is split into tabs — **Basics, Hero, About, Capabilities, Features, Problems,
   Rollout, Testimonials, FAQs, CTA & SEO**.
3. Edit the fields in a tab and **Save** that tab. Repeat for other tabs.
4. Use the **Published** switch to show/hide the whole module page, and **sort order** to
   change where it appears in module lists.
5. Images (hero, feature images) upload directly in the relevant tab.

**Add a new module:** Modules → **New**. Give it a name and a URL slug (lowercase, no
spaces), then fill in the tabs.

---

## Edit a solution page

Same pattern as modules. **Solutions → click a solution →** tabs (**Basics, Hero, Problems,
Use cases, Recommended modules, Testimonial, FAQs, CTA & SEO**). Note: a few fields
(audience, problems, testimonial) can be edited but are not shown on the public solution
page yet.

---

## Edit the home page

The home page is assembled from several admin screens:

| To change… | Go to… |
|------------|--------|
| Main headline, sub-headline, bullets, buttons, rotating graphic | **Home hero** |
| Customer logo row | **Trusted logos** (add a logo, optionally upload an image, set a link) |
| Numbers strip | **Home stats** |
| "Built for" cards | **Built for** |
| "Connected ecosystem" list | **Industry domains** |
| "Common questions" list | **FAQs** → choose **Home** |
| Closing banner | **Home CTA** |
| Section headings (e.g. "Built for", "Connected ecosystem") | the same screen as the section's items |

---

## Edit the About page

**About** has four tabs:

- **Hero** — eyebrow, title, subtitle.
- **Story** — image, badge, title, two paragraphs, and a highlighted callout box (icon,
  title, text, link).
- **Values** — a list of value cards (add / edit / reorder / publish).
- **CTA** — the closing call-to-action.

---

## Edit the Contact page

- **Contact** screen — support section text and cards, contact methods (email/phone/office,
  reorderable), the form's dropdown options, and the FAQ heading.
- **FAQs → Contact** — the FAQ questions and answers shown on `/contact`.
- **Page heroes → Contact** — the banner at the top of the page.

---

## Edit the "Book a demo" page

**Demo page** screen — hero text, the "what to expect" steps, benefits, testimonial, and the
form's dropdown lists (countries, business types) and button/success text.

---

---

## Upload a demo video

1. **Demo videos → New/Upload.** Give it a title and (optionally) tie it to a module.
2. Upload the video file (MP4). Large files are fine but upload from a good connection.
3. Set it to **Published** to make it available on the site.

---

## Menus, footer, logo

- **Nav resources** — the links/resources in the site navigation. *(Admin/Super Admin)*
- **Footer** — brand blurb, the link columns, newsletter heading and text, copyright, bottom
  links.
- **Site settings** — global things like the logo and the header button. *(Admin/Super Admin)*

---

## Chatbot knowledge (not shown on the public site)

Use **Chatbot knowledge** (Shared in the sidebar) for answers the chatbot should know
that you do **not** want in the public FAQ lists.

1. Go to **Chatbot knowledge**.
2. Add a **Title** and **Body** (what the bot should say). Optional **Category** is only
   for grouping in the dashboard.
3. Leave **Enabled** on so the article is available to the chatbot. Turn it off to pause
   an article without deleting it.
4. Save. These articles never appear on `/` or `/contact`.

Public FAQ lists still use **FAQs** (Home / Contact). Unpublishing an FAQ hides
it on the website; it is not a substitute for chatbot-only copy.

---

## Images — where they go

When you upload an image in any admin screen, it's stored with the site and served from a
stable web address. You don't manage files directly. To replace an image, upload a new one
in the same place.
