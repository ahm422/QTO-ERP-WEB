export const PAGE_HERO_KEY_BLOG = "blog" as const;
export const PAGE_HERO_KEY_ABOUT = "about" as const;
export const PAGE_HERO_KEY_CONTACT = "contact" as const;

export const PAGE_HERO_KEYS = [
  PAGE_HERO_KEY_BLOG,
  PAGE_HERO_KEY_ABOUT,
  PAGE_HERO_KEY_CONTACT,
] as const;

export type PageHeroPageKey = (typeof PAGE_HERO_KEYS)[number];

export type PageHeroContentFields = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export const PAGE_HERO_DEFAULTS: Record<
  PageHeroPageKey,
  PageHeroContentFields
> = {
  blog: {
    eyebrow: "Insights",
    title: "Blog",
    subtitle: "Insights, guides, and best practices for modern teams.",
  },
  about: {
    eyebrow: "Our Company",
    title: "About QTO-ERP",
    subtitle:
      "We're building the modern ERP that growing teams actually love to use.",
  },
  contact: {
    eyebrow: "Contact Our Team",
    title: "Let's Connect And Build Together",
    subtitle:
      "Whether you have questions, need technical support, want to explore a partnership, or just want to say hello—we're all ears.",
  },
};

export function isPageHeroPageKey(value: string): value is PageHeroPageKey {
  return (PAGE_HERO_KEYS as readonly string[]).includes(value);
}

export function pageHeroFromDefaults(
  pageKey: PageHeroPageKey,
): PageHeroContentFields {
  return { ...PAGE_HERO_DEFAULTS[pageKey] };
}
