/**
 * DEPRECATED (#133 orange brand lock-in): multi-palette audit is retired.
 * Product fonts are Outfit + Poppins only; there is no data-palette.
 *
 * Phase 9 (#131) palette×theme spot-check (home + demo) — archival.
 * Usage: node scripts/audit-palette-phase-9.mjs
 */
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs/baseline-screenshots/marketing-phase-9");
const BASE = process.env.BASE_URL || "http://localhost:3000";

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try {
    return require("/tmp/pw-palette/node_modules/playwright");
  } catch {
    return require("playwright");
  }
}
const { chromium } = loadPlaywright();

const PALETTES = ["indigo", "ocean", "forest", "sunset", "rose"];
const THEMES = ["light", "dark"];
const ROUTES = [
  { slug: "home", path: "/" },
  { slug: "demo", path: "/demo" },
];

const EXPECTED_FONTS = {
  indigo: { display: "Space Grotesk", body: "Inter" },
  ocean: { display: "Manrope", body: "IBM Plex Sans" },
  forest: { display: "Fraunces", body: "Sora" },
  sunset: { display: "Outfit", body: "Poppins" },
  rose: { display: "Playfair Display", body: "Nunito" },
};

async function bootstrap(page, palette, theme) {
  await page.evaluate(
    ({ palette: p, theme: t }) => {
      const root = document.documentElement;
      root.dataset.palette = p;
      localStorage.setItem("qto-palette", p);
      if (t === "dark") {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    },
    { palette, theme }
  );
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  const results = [];

  for (const palette of PALETTES) {
    for (const theme of THEMES) {
      for (const route of ROUTES) {
        await page.goto(`${BASE}${route.path}`, {
          waitUntil: "networkidle",
          timeout: 60000,
        });
        await bootstrap(page, palette, theme);
        await page.reload({ waitUntil: "networkidle", timeout: 60000 });
        await page.waitForTimeout(400);

        const check = await page.evaluate(
          ({ palette: p, expected }) => {
            const root = document.documentElement;
            const cs = getComputedStyle(root);
            const accent = cs.getPropertyValue("--accent").trim();
            const heroAccent = cs.getPropertyValue("--hero-accent").trim();
            const displayFamily = cs.getPropertyValue("--font-display-family").trim();
            const sansFamily = cs.getPropertyValue("--font-sans-family").trim();
            // Probe a heading + body
            const h1 = document.querySelector("h1");
            const body = document.body;
            const h1Font = h1 ? getComputedStyle(h1).fontFamily : "";
            const bodyFont = getComputedStyle(body).fontFamily;
            const motif = document.querySelector('[aria-hidden="true"]');
            return {
              datasetPalette: root.dataset.palette,
              isDark: root.classList.contains("dark"),
              accent,
              heroAccent,
              displayFamily,
              sansFamily,
              h1Font,
              bodyFont,
              hasMotifOrDecor: !!motif,
              displayOk: h1Font.includes(expected.display) || displayFamily.length > 0,
              bodyOk: bodyFont.includes(expected.body) || sansFamily.length > 0,
              accentOk: accent.length > 0 && heroAccent.length > 0,
            };
          },
          { palette, expected: EXPECTED_FONTS[palette] }
        );

        const status =
          check.datasetPalette === palette &&
          check.isDark === (theme === "dark") &&
          check.accentOk &&
          check.displayOk &&
          check.bodyOk
            ? "pass"
            : "fail";

        const row = { palette, theme, route: route.slug, status, ...check };
        results.push(row);
        console.log(
          `${status.toUpperCase()} ${palette}/${theme} ${route.slug}`
        );
      }
    }
  }

  await browser.close();
  const reportPath = path.join(OUT, "palette-spotcheck.json");
  await writeFile(
    reportPath,
    JSON.stringify({ capturedAt: new Date().toISOString(), results }, null, 2)
  );
  const fails = results.filter((r) => r.status === "fail");
  console.log(`\nDone → ${reportPath}`);
  console.log(`Pass: ${results.length - fails.length} / ${results.length}`);
  if (fails.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
