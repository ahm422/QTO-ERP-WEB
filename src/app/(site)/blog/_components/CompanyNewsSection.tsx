"use client";

import Link from "next/link";
import { Megaphone } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { BlogPostSummary } from "@/types/content";
import { getStaggerContainer, getStaggerItem, viewportOnce } from "@/lib/motion";
import { GridBackground } from "@/components/ui/grid-background";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";

function formatDateParts(iso: string) {
  const date = new Date(iso);
  return {
    day: date.toLocaleDateString("en-US", { day: "2-digit" }),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
  };
}

export default function CompanyNewsSection({
  posts,
}: {
  posts: BlogPostSummary[];
}) {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);

  if (posts.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="relative overflow-hidden rounded-3xl bg-neutral-950 text-neutral-50">
        <GridBackground opacity={0.28} className="text-neutral-400 px-6 py-8 sm:px-10 sm:py-10">
          <div className="relative z-10 mb-6 flex items-center justify-between gap-3">
            <EyebrowBadge label="Company News" icon={Megaphone} variant="inverse" />
            <h2 className="font-display text-lg font-bold text-white">
              From QTO ERP
            </h2>
          </div>

          <motion.div
            className="relative z-10 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            {posts.map((post) => {
              const { day, month } = formatDateParts(post.publishedAt);
              return (
                <motion.div key={post.slug} variants={item}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-white/5 sm:gap-6 sm:px-6"
                  >
                    <div className="text-left leading-none text-neutral-400">
                      <span className="block font-display text-2xl font-bold text-white">
                        {day}
                      </span>
                      <span className="text-xs font-semibold tracking-wide">{month}</span>
                    </div>
                    <p className="text-sm font-medium leading-snug text-neutral-100 sm:text-[15px]">
                      {post.title}
                    </p>
                    <span aria-hidden="true" className="hidden text-neutral-400 sm:inline">
                      &rarr;
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </GridBackground>
      </div>
    </section>
  );
}
