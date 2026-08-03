"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_PALETTE,
  isPaletteId,
  PALETTE_IDS,
  PALETTE_STORAGE_KEY,
  type PaletteId,
} from "@/lib/palette";

type PaletteContextValue = {
  palette: PaletteId;
  setPalette: (id: PaletteId) => void;
  palettes: readonly PaletteId[];
};

const PaletteContext = createContext<PaletteContextValue | null>(null);

function applyPalette(id: PaletteId) {
  document.documentElement.dataset.palette = id;
  try {
    localStorage.setItem(PALETTE_STORAGE_KEY, id);
  } catch {
    // Ignore quota / private-mode failures; DOM still updates.
  }
}

export function PaletteProvider({ children }: { children: ReactNode }) {
  // SSR + first client render default to indigo; sync from DOM after mount
  // (blocking head script may already have set data-palette before paint).
  const [palette, setPaletteState] = useState<PaletteId>(DEFAULT_PALETTE);

  useEffect(() => {
    const fromDom = document.documentElement.dataset.palette;
    if (isPaletteId(fromDom)) {
      setPaletteState(fromDom);
    }
  }, []);

  const setPalette = useCallback((id: PaletteId) => {
    if (!isPaletteId(id)) return;
    setPaletteState(id);
    applyPalette(id);
  }, []);

  const value = useMemo(
    () => ({
      palette,
      setPalette,
      palettes: PALETTE_IDS,
    }),
    [palette, setPalette],
  );

  return (
    <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
  );
}

export function usePalette(): PaletteContextValue {
  const ctx = useContext(PaletteContext);
  if (!ctx) {
    throw new Error("usePalette must be used within PaletteProvider");
  }
  return ctx;
}
