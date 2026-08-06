/**
 * Phase 8 (#129) marketing DNA full-site screenshot matrix.
 * Usage: node scripts/capture-marketing-phase-8.mjs
 * Requires: npm run dev on http://localhost:3000
 */
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs/baseline-screenshots/marketing-phase-8");
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
const ROUTES = [
  { slug: "home", path: "/" },
  { slug: "about", path: "/about" },
  { slug: "pricing", path: "/pricing" },
  { slug: "blog", path: "/blog" },
  { slug: "blog-post", path: "/blog/why-growing-teams-need-erp" },
  { slug: "contact", path: "/contact" },
  { slug: "demo", path: "/demo" },
  { slug: "erp-attendance", path: "/erp/attendance" },
  { slug: "solution-hr-teams", path: "/solution/hr-teams" },
  { slug: "allApps", path: "/allApps" },
  { slug: "style-guide", path: "/style-guide" },
];

async function applyTheme(page, theme) {
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
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  for (const route of ROUTES) {
    for (const theme of THEMES) {
      const file = `${route.slug}--${theme}.png`;
      const url = `${BASE}${route.path}`;
      console.log(`Capturing ${file} ← ${url}`);
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
      await applyTheme(page, theme);
      await page.reload({ waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(OUT, file),
        fullPage: true,
        type: "png",
      });
    }
  }

  await browser.close();
  console.log(`Done → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
