/**
 * Orange brand Phase 5 (#137) single-brand contrast AA check.
 * Usage: node scripts/audit-contrast-orange-phase-3-5.mjs
 * Requires: npm run dev on http://localhost:3000
 *
 * Measures orange×themes + module accent pairs via canvas sRGB luminance.
 * Does NOT revive the 5-palette matrix. Does not write palette-phase-4/.
 */
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(
  ROOT,
  "docs/baseline-screenshots/marketing-orange-phase-3-5"
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

/** Pairs: [fgVar, bgVar, label] */
const PAIRS = [
  ["--accent", "--background", "accent-on-background"],
  ["--accent-foreground", "--accent", "accent-fg-on-accent"],
  ["--foreground", "--background", "fg-on-background"],
  ["--foreground", "--card", "fg-on-card"],
  ["--muted-foreground", "--background", "muted-on-background"],
  ["--muted-foreground", "--card", "muted-on-card"],
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
        const lin = [r, g, b].map((c) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
      }
      function contrast(fg, bg) {
        const L1 = relLum(fg);
        const L2 = relLum(bg);
        const lighter = Math.max(L1, L2);
        const darker = Math.min(L1, L2);
        return (lighter + 0.05) / (darker + 0.05);
      }

      const styles = getComputedStyle(document.documentElement);
      return pairs.map(([fgVar, bgVar, label]) => {
        const fgRaw = styles.getPropertyValue(fgVar).trim();
        const bgRaw = styles.getPropertyValue(bgVar).trim();
        const fg = parseColor(fgRaw);
        const bg = parseColor(bgRaw);
        if (!fg || !bg) {
          return {
            label,
            fgVar,
            bgVar,
            ratio: null,
            status: "fail",
            detail: `unparsed fg=${fgRaw} bg=${bgRaw}`,
          };
        }
        const ratio = Math.round(contrast(fg, bg) * 100) / 100;
        const status = ratio >= 4.5 ? "pass" : "fail";
        return { label, fgVar, bgVar, ratio, status, detail: "" };
      });
    }, PAIRS);

    for (const row of measured) {
      results.push({ theme, ...row });
      console.log(
        `${row.status.toUpperCase()} ${theme} ${row.label} ${row.ratio ?? "—"}${row.detail ? ` — ${row.detail}` : ""}`
      );
    }
    await context.close();
  }

  await browser.close();
  const reportPath = path.join(OUT, "contrast-report.json");
  await writeFile(
    reportPath,
    JSON.stringify(
      {
        capturedAt: new Date().toISOString(),
        brand: "orange-single",
        note: "Single-brand gate only — 5-palette matrix superseded.",
        results,
      },
      null,
      2
    )
  );
  const fails = results.filter((r) => r.status === "fail");
  console.log(`\nDone → ${reportPath}`);
  console.log(
    `Pass: ${results.length - fails.length} / ${results.length}; Fail: ${fails.length}`
  );
  if (fails.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
