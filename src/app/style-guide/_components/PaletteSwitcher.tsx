"use client";

import { useEffect, useState } from "react";
import { usePalette } from "@/components/PaletteProvider";
import { PALETTE_LABELS } from "@/lib/palette";
import { cn } from "@/lib/utils";

export function PaletteSwitcher() {
  const { palette, setPalette, palettes } = usePalette();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) {
    return <div className="h-8 w-64" aria-hidden />;
  }

  return (
    <div
      role="group"
      aria-label="Brand palette"
      className="flex flex-wrap items-center gap-1"
    >
      {palettes.map((id) => {
        const active = palette === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            aria-label={PALETTE_LABELS[id]}
            onClick={() => setPalette(id)}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              active
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {PALETTE_LABELS[id]}
          </button>
        );
      })}
    </div>
  );
}
