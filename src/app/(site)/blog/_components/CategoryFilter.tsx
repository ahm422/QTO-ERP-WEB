"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Category = { name: string; count: number };

export default function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("category");
  const tag = searchParams.get("tag");

  const replaceParams = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    mutate(next);
    const qs = next.toString();
    router.replace(qs ? `/blog?${qs}` : "/blog");
  };

  return (
    <div className="mb-10 space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            replaceParams((next) => {
              next.delete("category");
            })
          }
          className={cn(
            "rounded-full border px-3 py-1 text-sm transition-colors",
            !current
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.name}
            onClick={() =>
              replaceParams((next) => {
                next.set("category", cat.name);
              })
            }
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              current === cat.name
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {cat.name}
            <span className="ml-1 opacity-70">({cat.count})</span>
          </button>
        ))}
      </div>
      {tag ? (
        <p className="text-sm text-muted-foreground">
          Tagged{" "}
          <span className="font-medium text-foreground">{tag}</span>
          {" · "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() =>
              replaceParams((next) => {
                next.delete("tag");
              })
            }
          >
            Clear tag
          </button>
        </p>
      ) : null}
    </div>
  );
}
