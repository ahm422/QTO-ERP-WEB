import { QTO_DEV_URL } from "@/lib/constants";

export const ABOUT_STORY_ID = "default" as const;

/** Public fallback until an R2 image_key is uploaded. */
export const FALLBACK_STORY_IMAGE_URL =
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop" as const;

export type AboutStoryDefaults = {
  id: typeof ABOUT_STORY_ID;
  imageKey: string | null;
  imageAlt: string;
  badge: string;
  title: string;
  paragraph1: string;
  paragraph2: string;
  calloutIconKey: string;
  calloutTitle: string;
  calloutBody: string;
  calloutLinkLabel: string;
  calloutLinkUrl: string;
};

export const ABOUT_STORY_DEFAULTS: AboutStoryDefaults = {
  id: ABOUT_STORY_ID,
  imageKey: null,
  imageAlt: "Our Story Illustration",
  badge: "Our Story",
  title: "Why We Built QTO-ERP",
  paragraph1:
    "We started QTO-ERP because we saw teams struggling with disconnected tools for attendance, HR, and project management. Spreadsheets, siloed apps, and manual processes were holding businesses back from their true potential.",
  paragraph2:
    "Our mission is simple: to give growing teams one powerful, intuitive platform that handles operational complexity flawlessly, so they can focus entirely on what matters — building great products and serving their customers.",
  calloutIconKey: "lightbulb",
  calloutTitle: "A Product of Passion",
  calloutBody:
    "QTO-ERP is proudly built by {link}, a dedicated team passionate about creating tools that fundamentally make the future of work better.",
  calloutLinkLabel: "QTO Dev",
  calloutLinkUrl: QTO_DEV_URL,
};
