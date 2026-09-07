"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MediaImage } from "@/components/ui/MediaImage";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import { HeaderSections } from "@/components/ui/HeaderSections";
import type { ModuleDetail } from "@/types/content";
import { AboutContentType } from "@/types";
import { CONTENT_PROSE_CLASS } from "@/lib/content-prose";
import { getFadeInUp, viewportOnce } from "@/lib/motion";

interface AboutSectionProps {
  app: ModuleDetail;
}

/** Escape + wrap the plain-text fallback paragraphs so both paths render as HTML. */
function toParagraphHtml(text: string): string {
  const safe = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<p>${safe}</p>`;
}

export default function AboutSection({ app }: AboutSectionProps) {
  const reduced = useReducedMotion();
  const fadeUp = getFadeInUp(reduced);
  const sectionHeadings = app.aboutSectionHeadings;
  const headingAt = (i: number) =>
    sectionHeadings[i] ?? sectionHeadings[0] ?? "";

  const rows: AboutContentType[] =
    app.aboutContents && app.aboutContents.length > 0
      ? app.aboutContents
      : app.aboutDescription.map((description, index) => ({
          id: index + 1,
          tag: headingAt(index),
          title: headingAt(index),
          description: toParagraphHtml(description),
          image: undefined,
          imageAlt: `${app.name} ${headingAt(index)}`,
        }));

  if (rows.length === 0) return null;

  return (
    <section id="about" className="section-padding bg-background">
      <div className="container-main max-w-6xl">
        <HeaderSections tag={app.aboutTag ?? "About"} title={app.aboutTitle} />

        <div className="mt-6 space-y-16 lg:space-y-24">
          {rows.map((row, index) => {
            const flip = index % 2 === 1;
            const hasImage = Boolean(row.image);
            return (
              <motion.div
                key={row.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                className={
                  hasImage
                    ? "grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
                    : "mx-auto max-w-3xl text-center"
                }
              >
                <div className={flip && hasImage ? "lg:order-2" : undefined}>
                  {row.tag ? (
                    <div
                      className={
                        hasImage ? "" : "flex justify-center"
                      }
                    >
                      <EyebrowBadge label={row.tag} variant="accent" />
                    </div>
                  ) : null}
                  {row.title && row.title !== row.tag ? (
                    <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-foreground md:text-3xl">
                      {row.title}
                    </h3>
                  ) : null}
                  <div
                    className={`${CONTENT_PROSE_CLASS} mt-4 max-w-none text-muted-foreground`}
                    dangerouslySetInnerHTML={{ __html: row.description }}
                  />
                </div>

                {hasImage ? (
                  <div className={flip ? "lg:order-1" : undefined}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted shadow-[var(--card-shadow)]">
                      <MediaImage
                        src={row.image as string}
                        alt={row.imageAlt || `${app.name} ${row.title}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
                    </div>
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
