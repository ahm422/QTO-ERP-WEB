export const PALETTE_IDS = [
  "indigo",
  "ocean",
  "forest",
  "sunset",
  "rose",
] as const;

export type PaletteId = (typeof PALETTE_IDS)[number];

/** localStorage key for the active brand palette id. */
export const PALETTE_STORAGE_KEY = "qto-palette";

/** CSS fallback when `data-palette` is absent (Phase 1 contract). */
export const DEFAULT_PALETTE: PaletteId = "indigo";

export const PALETTE_LABELS: Record<PaletteId, string> = {
  indigo: "Indigo",
  ocean: "Ocean",
  forest: "Forest",
  sunset: "Sunset",
  rose: "Rose",
};

/**
 * Preview-only light-theme accent fills for UI swatches (nav dots, style-guide cards).
 * Keep in sync with `[data-palette="…"]` light blocks in `globals.css`.
 * Live UI chrome still uses CSS vars (`--accent` / `--accent-dark`).
 */
export const PALETTE_SWATCH: Record<
  PaletteId,
  { accent: string; accentDark: string }
> = {
  indigo: { accent: "#4f46e5", accentDark: "#7c3aed" },
  ocean: {
    accent: "oklch(0.5106 0.0937 220)",
    accentDark: "oklch(0.5413 0.1174 236.04)",
  },
  forest: {
    accent: "oklch(0.5106 0.1272 155)",
    accentDark: "oklch(0.5413 0.1067 171.04)",
  },
  sunset: {
    accent: "oklch(0.5106 0.1476 45)",
    accentDark: "oklch(0.5413 0.1268 61.04)",
  },
  rose: {
    accent: "oklch(0.5106 0.2066 5)",
    accentDark: "oklch(0.5413 0.2189 21.04)",
  },
};

export function isPaletteId(value: unknown): value is PaletteId {
  return (
    typeof value === "string" &&
    (PALETTE_IDS as readonly string[]).includes(value)
  );
}

/**
 * Blocking inline IIFE for root layout `<head>`.
 * Reads localStorage and sets `document.documentElement.dataset.palette`
 * before paint. Missing/invalid values leave the attribute unset (indigo CSS fallback).
 */
export function getPaletteBootstrapScript(): string {
  const key = JSON.stringify(PALETTE_STORAGE_KEY);
  const ids = JSON.stringify(PALETTE_IDS);
  return `(function(){try{var k=${key},ids=${ids},v=localStorage.getItem(k);if(v&&ids.indexOf(v)!==-1)document.documentElement.dataset.palette=v}catch(e){}})();`;
}
