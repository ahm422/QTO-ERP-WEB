"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { BlogPostSummary } from "@/types/content";
import {
  getCardHover,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from "@/lib/motion";
import { Card } from "@/components/ui/card";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import { MarketingButton } from "@/components/ui/marketing-button";

type BlogPostsProps = {
  initialPosts: BlogPostSummary[];
  initialHasMore: boolean;
  category?: string;
  tag?: string;
  search?: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPosts({
  initialPosts,
  initialHasMore,
  category,
  tag,
  search,
}: BlogPostsProps) {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const hover = getCardHover(reduced);
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPosts(initialPosts);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialPosts, initialHasMore, category, tag, search]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: "9",
      });
      if (category) params.set("category", category);
      if (tag) params.set("tag", tag);
      if (search) params.set("q", search);
      const res = await fetch(`/api/blog?${params}`);
      const data = (await res.json()) as {
        posts?: BlogPostSummary[];
        hasMore?: boolean;
      };
      const next = data.posts ?? [];
      setPosts((prev) => [...prev, ...next]);
      setPage((p) => p + 1);
      setHasMore(Boolean(data.hasMore));
    } finally {
      setLoading(false);
    }
  };

  if (posts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No posts found.</p>
    );
  }

  return (
    <section>
      <motion.div
        className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
      >
        {posts.map((post) => (
          <motion.div key={post.slug} variants={item} whileHover={hover}>
            <Link href={`/blog/${post.slug}`} className="block h-full">
              <Card variant="interactive" radius="lg" padding="none" className="h-full">
                {post.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImageUrl}
                    alt=""
                    className="h-40 w-full rounded-t-2xl object-cover"
                  />
                ) : (
                  <div className="h-40 w-full rounded-t-2xl bg-muted" />
                )}
                <div className="p-4">
                  <EyebrowBadge
                    label={post.category}
                    variant="accent"
                    className="mb-3"
                  />
                  <h3 className="font-display text-lg font-bold leading-snug text-foreground">
                    {post.title}
                  </h3>
                  {post.excerpt ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
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
          </motion.div>
        ))}
      </motion.div>
      {hasMore ? (
        <div className="mt-8 flex justify-center">
          <MarketingButton
            type="button"
            variant="secondary"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more"}
          </MarketingButton>
        </div>
      ) : null}
    </section>
  );
}
