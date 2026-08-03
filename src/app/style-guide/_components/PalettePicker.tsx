"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { usePalette } from "@/components/PaletteProvider";
import { PALETTE_LABELS, PALETTE_SWATCH } from "@/lib/palette";
import { cn } from "@/lib/utils";

export function PalettePicker() {
  const { palette, setPalette, palettes } = usePalette();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return (
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
        aria-hidden
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Brand palettes"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
    >
      {palettes.map((id) => {
        const active = palette === id;
        const swatch = PALETTE_SWATCH[id];
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            aria-label={PALETTE_LABELS[id]}
            onClick={() => setPalette(id)}
            className={cn(
              "relative space-y-3 rounded-2xl border p-3 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              active
                ? "border-accent bg-accent/5 ring-2 ring-accent/40"
                : "border-border hover:border-muted-foreground/40 hover:bg-muted/40",
            )}
          >
            {active ? (
              <span className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Check className="size-3" aria-hidden />
              </span>
            ) : null}
            <div className="flex h-12 overflow-hidden rounded-xl ring-1 ring-border">
              <span
                className="w-1/2"
                style={{ backgroundColor: swatch.accent }}
              />
              <span
                className="w-1/2"
                style={{ backgroundColor: swatch.accentDark }}
              />
            </div>
            <div>
              <p className="text-sm font-medium">{PALETTE_LABELS[id]}</p>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                data-palette=&quot;{id}&quot;
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
