import sanitizeHtml from "sanitize-html";

const YOUTUBE_HOSTS = new Set(["www.youtube.com", "youtube.com", "youtu.be"]);
const ALIGN_CLASSES = new Set(["text-left", "text-center", "text-right"]);

function isAllowedHref(href: string): boolean {
  if (href.startsWith("mailto:")) {
    return href.length > "mailto:".length && !href.toLowerCase().includes("javascript:");
  }
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isAllowedImgSrc(src: string): boolean {
  if (src.startsWith("/api/media/")) {
    return !src.includes("..");
  }
  try {
    const url = new URL(src);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isYouTubeSrc(src: string): boolean {
  try {
    const url = new URL(src);
    return YOUTUBE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function filterAlignClass(className: string | undefined): string | undefined {
  if (!className) return undefined;
  const kept = className
    .split(/\s+/)
    .filter((token) => ALIGN_CLASSES.has(token));
  return kept.length > 0 ? kept.join(" ") : undefined;
}

function emptySpan(): sanitizeHtml.Tag {
  return { tagName: "span", attribs: {} };
}

export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "h1",
      "h2",
      "h3",
      "blockquote",
      "pre",
      "code",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "iframe",
      "div",
      "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
      iframe: [
        "src",
        "width",
        "height",
        "allow",
        "allowfullscreen",
        "frameborder",
        "title",
      ],
      p: ["class", "style"],
      h1: ["class", "style"],
      h2: ["class", "style"],
      h3: ["class", "style"],
      div: ["class", "style"],
      span: ["class", "style"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/^(left|center|right)$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https"],
      iframe: ["http", "https"],
    },
    allowIframeRelativeUrls: false,
    transformTags: {
      a: (_tagName, attribs) => {
        const href = attribs.href ?? "";
        if (!isAllowedHref(href)) {
          return emptySpan();
        }
        const next: Record<string, string> = { href };
        if (attribs.target === "_blank") {
          next.target = "_blank";
          next.rel = "noopener noreferrer";
        }
        return { tagName: "a", attribs: next };
      },
      img: (_tagName, attribs) => {
        const src = attribs.src ?? "";
        if (!isAllowedImgSrc(src)) {
          return emptySpan();
        }
        return {
          tagName: "img",
          attribs: { src, alt: attribs.alt ?? "" },
        };
      },
      iframe: (_tagName, attribs) => {
        const src = attribs.src ?? "";
        if (!isYouTubeSrc(src)) {
          return emptySpan();
        }
        return {
          tagName: "iframe",
          attribs: {
            src,
            width: attribs.width ?? "560",
            height: attribs.height ?? "315",
            allow:
              attribs.allow ??
              "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            allowfullscreen: "true",
            frameborder: "0",
            title: attribs.title ?? "YouTube video",
          },
        };
      },
      p: (_tagName, attribs) => ({
        tagName: "p",
        attribs: pickAlignAttribs(attribs),
      }),
      h1: (_tagName, attribs) => ({
        tagName: "h1",
        attribs: pickAlignAttribs(attribs),
      }),
      h2: (_tagName, attribs) => ({
        tagName: "h2",
        attribs: pickAlignAttribs(attribs),
      }),
      h3: (_tagName, attribs) => ({
        tagName: "h3",
        attribs: pickAlignAttribs(attribs),
      }),
      div: (_tagName, attribs) => ({
        tagName: "div",
        attribs: pickAlignAttribs(attribs),
      }),
      span: (_tagName, attribs) => ({
        tagName: "span",
        attribs: pickAlignAttribs(attribs),
      }),
    },
  });
}

function pickAlignAttribs(attribs: Record<string, string>): Record<string, string> {
  const next: Record<string, string> = {};
  const className = filterAlignClass(attribs.class);
  if (className) next.class = className;
  const align = attribs.style
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => /^text-align\s*:/i.test(part));
  if (align) {
    const value = align.split(":")[1]?.trim().toLowerCase();
    if (value === "left" || value === "center" || value === "right") {
      next.style = `text-align:${value}`;
    }
  }
  return next;
}
