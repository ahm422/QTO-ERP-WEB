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
