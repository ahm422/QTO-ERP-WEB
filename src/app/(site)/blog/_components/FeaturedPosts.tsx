"use client";

import Link from "next/link";
import type { BlogPostSummary } from "@/types/content";
import { Card } from "@/components/ui/card";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function FeaturedPosts({ posts }: { posts: BlogPostSummary[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="mb-4 font-display text-xl font-bold text-foreground">
        Featured
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.slice(0, 2).map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
            <Card variant="interactive" radius="lg" padding="none">
              {post.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.coverImageUrl}
                  alt=""
                  className="h-52 w-full rounded-t-lg object-cover"
                />
              ) : (
                <div className="h-52 w-full rounded-t-lg bg-muted" />
              )}
              <div className="p-5">
                <EyebrowBadge
                  label={post.category}
                  variant="accent"
                  className="mb-3"
                />
                <h3 className="font-display text-2xl font-bold leading-snug text-foreground">
                  {post.title}
                </h3>
                {post.excerpt ? (
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-muted-foreground">
                  {post.authorName} · {formatDate(post.publishedAt)}
                  {post.readTimeMinutes
                    ? ` · ${post.readTimeMinutes} min read`
                    : ""}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
