"use client";

import { Check, Minus } from "lucide-react";
import { HeaderSections } from "@/components/ui/HeaderSections";
import { cn } from "@/lib/utils";

function ComparisonCell({ value }: { value: string }) {
  if (value === "✓") {
    return (
      <Check className="mx-auto h-4 w-4 text-accent" aria-hidden />
    );
  }
  if (value === "—") {
    return (
      <Minus
        className="mx-auto h-4 w-4 text-muted-foreground/60"
        aria-hidden
      />
    );
  }
  return <>{value}</>;
}

export type ComparisonColumn = {
  key: string;
  name: string;
};

export type ComparisonRow = {
  feature: string;
  values: Record<string, string>;
};

export type ComparisonTableProps = {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  /** Wrap in section + HeaderSections chrome. Default true for page use. */
  embedded?: boolean;
  title?: string;
  tag?: string;
  className?: string;
};

/**
 * Shared feature comparison matrix — token-driven checks, no hardcoded plan keys.
 */
export function ComparisonTable({
  columns,
  rows,
  embedded = false,
  title = "Feature Comparison",
  tag = "Compare",
  className,
}: ComparisonTableProps) {
  const table = (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-border bg-card",
        className
      )}
    >
      <table className="w-full min-w-[36rem] text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="p-4 text-left font-semibold uppercase tracking-wider text-muted-foreground">
              Modules
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className="p-4 text-center font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.feature}
              className="border-b border-border last:border-0"
            >
              <td className="p-4 text-foreground">{row.feature}</td>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="p-4 text-center text-muted-foreground"
                >
                  <ComparisonCell value={row.values[col.key] ?? "—"} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (embedded) {
    return table;
  }

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-main max-w-4xl">
        <HeaderSections tag={tag} title={title} />
        {table}
      </div>
    </section>
  );
}
