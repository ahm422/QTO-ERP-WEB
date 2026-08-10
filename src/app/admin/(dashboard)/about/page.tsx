"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeroEditor } from "@/components/admin/PageHeroEditor";
import { PAGE_HERO_KEY_ABOUT } from "@/lib/page-hero-defaults";
import { cn } from "@/lib/utils";
import { AboutCtaEditor } from "./_components/AboutCtaEditor";
import { AboutStoryEditor } from "./_components/AboutStoryEditor";
import { AboutValuesEditor } from "./_components/AboutValuesEditor";

const TABS = [
  { key: "hero", label: "Hero" },
  { key: "story", label: "Story" },
  { key: "values", label: "Values" },
  { key: "cta", label: "CTA" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isTabKey(value: string): value is TabKey {
  return TABS.some((tab) => tab.key === value);
}

function AboutAdminInner() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab")?.trim() || "hero";
  const tab: TabKey = isTabKey(raw) ? raw : "hero";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">About page</h1>
        <p className="text-sm text-muted-foreground">
          Edit hero, Our Story, Values cards, and the closing CTA for{" "}
          <code className="text-xs">/about</code>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <Link
            key={item.key}
            href={`/admin/about?tab=${item.key}`}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              tab === item.key
                ? "border-primary bg-primary/10 font-medium text-foreground"
                : "border-border text-muted-foreground hover:bg-muted/50",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {tab === "hero" ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Uses shared{" "}
            <code className="text-xs">page_hero_content</code> with{" "}
            <code className="text-xs">pageKey=about</code>. Also editable under{" "}
            <Link
              href="/admin/page-hero?pageKey=about"
              className="underline underline-offset-2"
            >
              Page heroes
            </Link>
            .
          </p>
          <PageHeroEditor pageKey={PAGE_HERO_KEY_ABOUT} />
        </div>
      ) : null}
      {tab === "story" ? <AboutStoryEditor /> : null}
      {tab === "values" ? <AboutValuesEditor /> : null}
      {tab === "cta" ? <AboutCtaEditor /> : null}
    </div>
  );
}

export default function AboutAdminPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
    >
      <AboutAdminInner />
    </Suspense>
  );
}
