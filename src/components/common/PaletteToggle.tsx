"use client";

import { useEffect, useState } from "react";
import { usePalette } from "@/components/PaletteProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  isPaletteId,
  PALETTE_LABELS,
  PALETTE_SWATCH,
} from "@/lib/palette";

export function PaletteToggle() {
  const { palette, setPalette, palettes } = usePalette();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Brand palette"
          className="rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <span
            aria-hidden
            className="size-4 rounded-full ring-1 ring-border"
            style={{ backgroundColor: PALETTE_SWATCH[palette].accent }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuRadioGroup
          value={palette}
          onValueChange={(value) => {
            if (isPaletteId(value)) setPalette(value);
          }}
        >
          {palettes.map((id) => (
            <DropdownMenuRadioItem key={id} value={id}>
              <span
                aria-hidden
                className="size-3 shrink-0 rounded-full ring-1 ring-border"
                style={{ backgroundColor: PALETTE_SWATCH[id].accent }}
              />
              {PALETTE_LABELS[id]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
