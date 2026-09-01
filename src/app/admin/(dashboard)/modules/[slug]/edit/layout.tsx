"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  ExternalLink,
  HelpCircle,
  Layers,
  LayoutGrid,
  ListChecks,
  Megaphone,
  Quote,
  Rocket,
  Target,
  type LucideIcon,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SECTIONS: [string, string, LucideIcon][] = [
  ["basics", "Basics", LayoutGrid],
  ["hero", "Hero", Megaphone],
  ["about", "About / Story", BookOpen],
  ["capabilities", "Capabilities", Layers],
  ["features", "Features", ListChecks],
  ["rollout", "Rollout", Rocket],
  ["problems", "Problems", AlertTriangle],
  ["testimonials", "Testimonials", Quote],
  ["faqs", "FAQs", HelpCircle],
  ["cta-seo", "CTA & SEO", Target],
];

export default function ModuleEditLayout({
  children,
}: {
  children: ReactNode;
}) {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const pathname = usePathname();
  const base = `/admin/modules/${slug}/edit`;
  const [name, setName] = useState("");

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
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={`/erp/${slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1.5 size-4" /> Preview
            </Link>
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/admin/modules">
              <ArrowLeft className="mr-1.5 size-4" /> All modules
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-2 shadow-sm lg:sticky lg:top-4 lg:h-fit lg:flex-col lg:overflow-visible">
          {SECTIONS.map(([key, label, Icon]) => {
            const href = `${base}/${key}`;
            const active =
              pathname === href || (key === "basics" && pathname === base);
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
