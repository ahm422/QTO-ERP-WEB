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
      <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-start justify-between gap-3 border-b border-border bg-background/95 px-1 pb-4 pt-1 backdrop-blur">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
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
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
        </div>
      ) : (
        <div className="space-y-6 pb-16">{children}</div>
      )}
    </div>
  );
}

/** A labelled card that groups related fields. */
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
    <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {hint ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
