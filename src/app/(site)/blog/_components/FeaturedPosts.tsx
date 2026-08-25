"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { BlogPostSummary } from "@/types/content";
import { getCardHover, getStaggerContainer, getStaggerItem, viewportOnce } from "@/lib/motion";
import { Card } from "@/components/ui/card";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function CoverImage({
  post,
  className,
}: {
  post: BlogPostSummary;
  className: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {post.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-accent to-accent-dark" />
      )}
      <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
        {post.category}
      </span>
    </div>
  );
}

function MetaRow({ post }: { post: BlogPostSummary }) {
  return (
    <p className="mt-auto flex flex-wrap items-center gap-x-2 pt-1 text-xs text-muted-foreground">
      <span className="h-5 w-5 shrink-0 rounded-full bg-gradient-to-br from-accent to-accent-dark" />
      <span>{post.authorName}</span>
      <span aria-hidden="true">·</span>
      <span>{formatDate(post.publishedAt)}</span>
      {post.readTimeMinutes ? (
        <>
          <span aria-hidden="true">·</span>
          <span>{post.readTimeMinutes} min read</span>
        </>
      ) : null}
    </p>
  );
}

export default function FeaturedPosts({ posts }: { posts: BlogPostSummary[] }) {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const hover = getCardHover(reduced);

  if (posts.length === 0) return null;

  const [primary, ...secondary] = posts.slice(0, 3);

  return (
    <section className="mb-12">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
            Editor&rsquo;s picks
          </p>
          <h2 className="font-display text-xl font-bold text-foreground">
            Featured Articles
          </h2>
        </div>
      </div>

      <motion.div
        className={
          secondary.length > 0
            ? "grid gap-5 lg:grid-cols-[1.35fr_1fr]"
            : "grid gap-5"
        }
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        <motion.div variants={item} whileHover={hover}>
          <Link href={`/blog/${primary.slug}`} className="block h-full">
            <Card variant="interactive" radius="xl" padding="none" className="flex h-full flex-col">
              <CoverImage post={primary} className="aspect-video" />
              <div className="flex flex-1 flex-col gap-3 p-6">
                <h3 className="font-display text-2xl font-bold leading-snug text-foreground">
                  {primary.title}
                </h3>
                {primary.excerpt ? (
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {primary.excerpt}
                  </p>
                ) : null}
                <MetaRow post={primary} />
              </div>
            </Card>
          </Link>
        </motion.div>

        {secondary.length > 0 ? (
          <div className="flex flex-col gap-5">
            {secondary.map((post) => (
              <motion.div key={post.slug} variants={item} whileHover={hover} className="flex-1">
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  <Card variant="interactive" radius="xl" padding="none" className="flex h-full flex-col">
                    <CoverImage post={post} className="aspect-[16/9]" />
                    <div className="flex flex-1 flex-col gap-2 p-5">
                      <h3 className="font-display text-lg font-bold leading-snug text-foreground">
                        {post.title}
                      </h3>
                      <MetaRow post={post} />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : null}
      </motion.div>
    </section>
  );
}
