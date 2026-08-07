/**
 * Home visual fidelity (#139) contrast AA check (FAQ/footer surfaces).
 * Usage: node scripts/audit-contrast-home-visual-phase.mjs
 * Requires: npm run dev on http://localhost:3000
 *
 * Writes docs/baseline-screenshots/marketing-home-visual-phase/contrast-report.json
 * Does not overwrite marketing-orange-phase-3-5/.
 */
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(
  ROOT,
  "docs/baseline-screenshots/marketing-home-visual-phase"
);
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

const THEMES = ["light", "dark"];

const PAIRS = [
  ["--accent", "--background", "accent-on-background"],
  ["--accent-foreground", "--accent", "accent-fg-on-accent"],
  ["--foreground", "--background", "fg-on-background"],
  ["--foreground", "--card", "fg-on-card"],
  ["--muted-foreground", "--background", "muted-on-background"],
  ["--muted-foreground", "--card", "muted-on-card"],
  ["--hero-accent", "--background", "hero-accent-on-background"],
  ["--module-hr", "--module-hr-bg", "module-hr"],
  ["--module-inventory", "--module-inventory-bg", "module-inventory"],
  ["--module-crm", "--module-crm-bg", "module-crm"],
  ["--module-payroll", "--module-payroll-bg", "module-payroll"],
  ["--module-mfg", "--module-mfg-bg", "module-mfg"],
  ["--module-accounting", "--module-accounting-bg", "module-accounting"],
];

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const theme of THEMES) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
    await page.evaluate((t) => {
      const root = document.documentElement;
      if (t === "dark") {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }, theme);
    await page.reload({ waitUntil: "networkidle", timeout: 60000 });

    const measured = await page.evaluate((pairs) => {
      function parseColor(css) {
        const el = document.createElement("div");
        el.style.color = css;
        document.body.appendChild(el);
        const computed = getComputedStyle(el).color;
        document.body.removeChild(el);
        const m = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!m) return null;
        return [Number(m[1]), Number(m[2]), Number(m[3])];
      }
      function relLum([r, g, b]) {
        const toLin = (c) => {
          const s = c / 255;
          return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        const R = toLin(r);
        const G = toLin(g);
        const B = toLin(b);
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
      }
      function contrast(fg, bg) {
        const L1 = relLum(fg);
        const L2 = relLum(bg);
        const lighter = Math.max(L1, L2);
        const darker = Math.min(L1, L2);
        return (lighter + 0.05) / (darker + 0.05);
      }

      const root = getComputedStyle(document.documentElement);
      return pairs.map(([fgVar, bgVar, label]) => {
        const fgCss = root.getPropertyValue(fgVar).trim();
        const bgCss = root.getPropertyValue(bgVar).trim();
        const fg = parseColor(fgCss);
        const bg = parseColor(bgCss);
        if (!fg || !bg) {
          return { label, fgVar, bgVar, ratio: null, pass: false, error: "parse" };
        }
        const ratio = contrast(fg, bg);
        return {
          label,
          fgVar,
          bgVar,
          fg: fgCss,
          bg: bgCss,
          ratio: Math.round(ratio * 100) / 100,
          pass: ratio >= 4.5,
        };
      });
    }, PAIRS);

    for (const row of measured) {
      results.push({ theme, ...row });
    }
    await context.close();
  }

  await browser.close();
  const passed = results.filter((r) => r.pass).length;
  const report = {
    issue: 139,
    generatedAt: new Date().toISOString(),
    threshold: 4.5,
    passed,
    total: results.length,
    results,
  };
  await writeFile(
    path.join(OUT, "contrast-report.json"),
    JSON.stringify(report, null, 2) + "\n"
  );
  console.log(`Contrast ${passed}/${results.length} → ${OUT}/contrast-report.json`);
  if (passed < results.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
