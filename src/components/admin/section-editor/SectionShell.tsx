"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ExternalLink, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

type SectionShellProps = {
  title: string;
  description?: string;
  /** Public URL this section affects, e.g. `/erp/attendance`. */
  viewHref?: string;
  loading: boolean;
  saving: boolean;
  onSave: () => void;
  onReset?: () => void;
  children: ReactNode;
};

export function SectionShell({
  title,
  description,
  viewHref,
  loading,
  saving,
  onSave,
  onReset,
  children,
}: SectionShellProps) {
  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card/95 px-5 py-4 shadow-sm backdrop-blur">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {viewHref ? (
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href={viewHref} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1.5 size-3.5" />
                View page
              </Link>
            </Button>
          ) : null}
          {onReset ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={saving}
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              Reset
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={saving || loading}
          >
            <Save className="mr-1.5 size-3.5" />
            {saving ? "Saving…" : "Save section"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
          <div className="h-24 animate-pulse rounded-lg bg-muted lg:col-span-2" />
          <div className="h-40 animate-pulse rounded-lg bg-muted lg:col-span-2" />
        </div>
      ) : (
        <div className="grid gap-x-6 gap-y-5 pb-16 lg:grid-cols-2">
          {children}
        </div>
      )}
    </div>
  );
}

/** A labelled card that groups related fields; spans the full editor width. */
export function FieldGroup({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {hint ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      <div className="grid gap-x-6 gap-y-5 lg:grid-cols-2">{children}</div>
    </section>
  );
}
