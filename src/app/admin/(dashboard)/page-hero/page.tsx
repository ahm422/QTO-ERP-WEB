"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminFormWidth } from "@/components/admin/AdminFormWidth";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageHeroEditor } from "@/components/admin/PageHeroEditor";
import {
  PAGE_HERO_KEY_ABOUT,
  PAGE_HERO_KEY_BLOG,
  PAGE_HERO_KEY_CONTACT,
  isPageHeroPageKey,
  type PageHeroPageKey,
} from "@/lib/page-hero-defaults";
import { cn } from "@/lib/utils";

const PAGE_HERO_TABS: Array<{ key: PageHeroPageKey; label: string }> = [
  { key: PAGE_HERO_KEY_BLOG, label: "Blog" },
  { key: PAGE_HERO_KEY_ABOUT, label: "About" },
  { key: PAGE_HERO_KEY_CONTACT, label: "Contact" },
];

function PageHeroAdminInner() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("pageKey")?.trim() || PAGE_HERO_KEY_BLOG;
  const pageKey: PageHeroPageKey = isPageHeroPageKey(raw)
    ? raw
    : PAGE_HERO_KEY_BLOG;

  return (
    <AdminPage spacing="md">
      <AdminFormWidth size="md" className="space-y-6">
      <AdminPageHeader
        title="Page heroes"
        description={
          <>
            Shared eyebrow / title / subtitle for marketing page heroes. Public
            wiring is live for <code className="text-xs">/blog</code>,{" "}
            <code className="text-xs">/about</code> (also editable under{" "}
            <Link
              href="/admin/about?tab=hero"
              className="underline underline-offset-2"
            >
              About page
            </Link>
            ), and <code className="text-xs">/contact</code> (also editable
            under{" "}
            <Link
              href="/admin/contact"
              className="underline underline-offset-2"
            >
              Contact page
            </Link>
            ).
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        {PAGE_HERO_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/page-hero?pageKey=${tab.key}`}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              pageKey === tab.key
                ? "border-primary bg-primary/10 font-medium text-foreground"
                : "border-border text-muted-foreground hover:bg-muted/50",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <PageHeroEditor key={pageKey} pageKey={pageKey} />
      </AdminFormWidth>
    </AdminPage>
  );
}

export default function PageHeroAdminPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
    >
      <PageHeroAdminInner />
    </Suspense>
  );
}
