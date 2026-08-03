/**
 * One-off Phase 4 (#111) visual matrix + contrast re-measure.
 * Usage: node scripts/capture-palette-phase-4.mjs
 * Requires: npm run dev on http://localhost:3000
 */
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs/baseline-screenshots/palette-phase-4");
const BASE = process.env.BASE_URL || "http://localhost:3000";

// Prefer local dep; fall back to one-off install under /tmp/pw-palette (CI/dev machines without playwright).
const require = createRequire(import.meta.url);
function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    return require("/tmp/pw-palette/node_modules/playwright");
  }
}
const { chromium } = loadPlaywright();

const PALETTES = ["indigo", "ocean", "forest", "sunset", "rose"];
const THEMES = ["light", "dark"];
const ROUTES = [
  { slug: "home", path: "/" },
  { slug: "demo", path: "/demo" },
  { slug: "erp-attendance", path: "/erp/attendance" },
  { slug: "style-guide", path: "/style-guide" },
];

function srgbChannel(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r, g, b) {
  return (
    0.2126 * srgbChannel(r) +
    0.7152 * srgbChannel(g) +
    0.0722 * srgbChannel(b)
  );
}

function contrastRatio(fg, bg) {
  const L1 = relativeLuminance(...fg);
  const L2 = relativeLuminance(...bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function measureContrast(page, palette, theme) {
  return page.evaluate(({ palette, theme }) => {
    const root = document.documentElement;
    const cs = getComputedStyle(root);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    function resolveRgb(cssValue) {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000";
      ctx.fillStyle = cssValue;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return { css: cssValue, rgb: [r, g, b] };
    }

    function tokenColor(prop) {
      // Resolve via computed background so oklch/hex/color-mix all become paint colors
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:fixed;left:-9999px;top:0;width:1px;height:1px;";
      probe.style.backgroundColor = `var(${prop})`;
      document.body.appendChild(probe);
      const computed = getComputedStyle(probe).backgroundColor;
      document.body.removeChild(probe);
      return resolveRgb(computed);
    }

    const accent = tokenColor("--accent");
    const accentFg = tokenColor("--accent-foreground");
    const accentDark = tokenColor("--accent-dark");
    const background = tokenColor("--background");
    const heroAccent = tokenColor("--hero-accent");

    return {
      palette,
      theme,
      raw: {
        accent: accent.css,
        accentRgb: accent.rgb,
        accentFg: accentFg.css,
        accentFgRgb: accentFg.rgb,
        accentDark: accentDark.css,
        accentDarkRgb: accentDark.rgb,
        background: background.css,
        backgroundRgb: background.rgb,
        heroAccent: heroAccent.css,
        heroAccentRgb: heroAccent.rgb,
        dataPalette: root.dataset.palette || "",
        hasDark: root.classList.contains("dark"),
        accentCss: cs.getPropertyValue("--accent").trim(),
      },
    };
  }, { palette, theme });
}

async function applyThemeAndPalette(page, theme, palette) {
  await page.evaluate(
    ({ theme, palette }) => {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      root.dataset.palette = palette;
      localStorage.setItem("qto-palette", palette);
    },
    { theme, palette },
  );
  // Give next-themes / paint a beat
  await page.waitForTimeout(150);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const contrastRows = [];
  const captures = [];

  // Warm + contrast pass on home for all palette×theme
  for (const theme of THEMES) {
    for (const palette of PALETTES) {
      await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 120000 });
      await applyThemeAndPalette(page, theme, palette);
      await page.reload({ waitUntil: "networkidle", timeout: 120000 });
      await applyThemeAndPalette(page, theme, palette);
      await page.waitForTimeout(300);

      const raw = await measureContrast(page, palette, theme);
      const accent = raw.raw.accentRgb;
      const accentFg = raw.raw.accentFgRgb;
      const accentDark = raw.raw.accentDarkRgb;
      const background = raw.raw.backgroundRgb;
      const heroAccent = raw.raw.heroAccentRgb;

      const row = {
        palette,
        theme,
        accentFgOnAccent:
          accent && accentFg ? contrastRatio(accentFg, accent) : null,
        accentOnBackground:
          accent && background ? contrastRatio(accent, background) : null,
        accentDarkOnBackground:
          accentDark && background
            ? contrastRatio(accentDark, background)
            : null,
        heroAccentOnBackground:
          heroAccent && background
            ? contrastRatio(heroAccent, background)
            : null,
        raw: raw.raw,
      };
      contrastRows.push(row);
      console.log(
        `contrast ${palette} ${theme}: fg/accent=${row.accentFgOnAccent?.toFixed(2)} accent/bg=${row.accentOnBackground?.toFixed(2)} dark/bg=${row.accentDarkOnBackground?.toFixed(2)}`,
      );
    }
  }

  // Visual matrix
  const skipShots = process.env.SKIP_SCREENSHOTS === "1";
  if (!skipShots) {
    for (const route of ROUTES) {
      for (const theme of THEMES) {
        for (const palette of PALETTES) {
          const name = `${route.slug}--${palette}--${theme}.png`;
          const file = path.join(OUT, name);
          await page.goto(`${BASE}${route.path}`, {
            waitUntil: "networkidle",
            timeout: 120000,
          });
          await applyThemeAndPalette(page, theme, palette);
          // Reload so bootstrap + CSS settle consistently
          await page.reload({ waitUntil: "networkidle", timeout: 120000 });
          await applyThemeAndPalette(page, theme, palette);
          await page.waitForTimeout(400);
          await page.screenshot({ path: file, fullPage: true });
          captures.push(name);
          console.log(`captured ${name}`);
        }
      }
    }
  } else {
    console.log("SKIP_SCREENSHOTS=1 — contrast only");
  }

  const report = {
    capturedAt: new Date().toISOString(),
    baseUrl: BASE,
    viewport: "1440x900",
    captures,
    contrast: contrastRows.map((r) => ({
      palette: r.palette,
      theme: r.theme,
      accentFgOnAccent: r.accentFgOnAccent
        ? Number(r.accentFgOnAccent.toFixed(2))
        : null,
      accentOnBackground: r.accentOnBackground
        ? Number(r.accentOnBackground.toFixed(2))
        : null,
      accentDarkOnBackground: r.accentDarkOnBackground
        ? Number(r.accentDarkOnBackground.toFixed(2))
        : null,
      heroAccentOnBackground: r.heroAccentOnBackground
        ? Number(r.heroAccentOnBackground.toFixed(2))
        : null,
      aa: {
        accentFgOnAccent: (r.accentFgOnAccent ?? 0) >= 4.5,
        accentOnBackground: (r.accentOnBackground ?? 0) >= 4.5,
        accentDarkOnBackground: (r.accentDarkOnBackground ?? 0) >= 4.5,
      },
    })),
  };

  await writeFile(
    path.join(OUT, "contrast-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(`Wrote ${captures.length} screenshots + contrast-report.json`);

  const failures = report.contrast.filter(
    (c) =>
      !c.aa.accentFgOnAccent ||
      !c.aa.accentOnBackground ||
      !c.aa.accentDarkOnBackground,
  );
  if (failures.length) {
    console.error("AA failures:", failures);
    process.exitCode = 1;
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
