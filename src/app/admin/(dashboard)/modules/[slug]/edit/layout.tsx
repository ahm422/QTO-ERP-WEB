"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  ["basics", "Basics"],
  ["hero", "Hero"],
  ["about", "About / Story"],
  ["capabilities", "Capabilities"],
  ["features", "Features"],
  ["rollout", "Rollout"],
  ["problems", "Problems"],
  ["testimonials", "Testimonials"],
  ["faqs", "FAQs"],
  ["cta-seo", "CTA & SEO"],
] as const;

export default function ModuleEditLayout({
  children,
}: {
  children: ReactNode;
}) {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const pathname = usePathname();
  const base = `/admin/modules/${slug}/edit`;
  const [name, setName] = useState<string>("");

  useEffect(() => {
    void adminFetch<{ item: { name?: string } }>(`/api/admin/modules/${slug}`)
      .then((d) => setName(d.item?.name ?? ""))
      .catch(() => {});
  }, [slug]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Edit module
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            {name || slug}
          </h1>
          <p className="font-mono text-xs text-muted-foreground">/erp/{slug}</p>
        </div>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/admin/modules">
            <ArrowLeft className="mr-1.5 size-4" /> All modules
          </Link>
        </Button>
      </div>

      <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1.5 shadow-sm">
        {SECTIONS.map(([key, label]) => {
          const href = `${base}/${key}`;
          const active =
            pathname === href || (key === "basics" && pathname === base);
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="max-w-3xl">{children}</div>
    </div>
  );
}
