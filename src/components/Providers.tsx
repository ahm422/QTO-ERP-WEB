"use client";

import { ThemeProvider } from "next-themes";
import { PaletteProvider } from "@/components/PaletteProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <PaletteProvider>{children}</PaletteProvider>
    </ThemeProvider>
  );
}
