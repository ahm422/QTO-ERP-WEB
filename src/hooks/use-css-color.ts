"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

function cssToHex(cssColor: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return fallback;
    ctx.fillStyle = "#000000";
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  } catch {
    return fallback;
  }
}

function readCssColor(varName: string, fallback: string): THREE.Color {
  if (typeof document === "undefined") return new THREE.Color(fallback);
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return new THREE.Color(cssToHex(raw || fallback, fallback));
}

/**
 * Resolve a CSS custom property to a THREE.Color, re-reading when the
 * documentElement class (theme) or data-theme changes.
 */
export function useCssColor(
  varName: string,
  fallback = "#ffffff",
): THREE.Color {
  const [color, setColor] = useState(() => readCssColor(varName, fallback));

  useEffect(() => {
    const read = () => setColor(readCssColor(varName, fallback));
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, [varName, fallback]);

  return color;
}
