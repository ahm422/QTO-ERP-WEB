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
  ["problems", "Problems"],
  ["use-cases", "Use cases"],
  ["recommended", "Recommended modules"],
  ["testimonial", "Testimonial"],
  ["faqs", "FAQs"],
  ["cta-seo", "Tabs, CTA & SEO"],
] as const;

export default function SolutionEditLayout({
  children,
}: {
  children: ReactNode;
}) {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const pathname = usePathname();
  const base = `/admin/solutions/${slug}/edit`;
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    void adminFetch<{ item: { title?: string } }>(
      `/api/admin/solutions/${slug}`,
    )
      .then((d) => setTitle(d.item?.title ?? ""))
      .catch(() => {});
  }, [slug]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Edit solution
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            {title || slug}
          </h1>
          <p className="font-mono text-xs text-muted-foreground">
            /solution/{slug}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/admin/solutions">
            <ArrowLeft className="mr-1.5 size-4" /> All solutions
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
