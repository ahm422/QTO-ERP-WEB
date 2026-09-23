/**
 * Orange brand Phase 5 (#137) baseline screenshots.
 * Usage: node scripts/capture-marketing-orange-phase-3-5.mjs
 * Requires: npm run dev on http://localhost:3000
 *
 * Writes docs/baseline-screenshots/marketing-orange-phase-3-5/
 * Does not overwrite marketing-phase-9/ or palette-phase-4/ archives.
 */
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
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
const ROUTES = [
  { slug: "home", path: "/" },
  { slug: "about", path: "/about" },
  { slug: "blog", path: "/blog" },
  { slug: "blog-post", path: "/blog/why-growing-teams-need-erp" },
  { slug: "contact", path: "/contact" },
  { slug: "demo", path: "/demo" },
  { slug: "erp-attendance", path: "/erp/attendance" },
  { slug: "solution-hr-teams", path: "/solution/hr-teams" },
  { slug: "allApps", path: "/allApps" },
  { slug: "style-guide", path: "/style-guide" },
];

const VIEWPORT_ROUTES = [
  { slug: "home", path: "/" },
  { slug: "demo", path: "/demo" },
];
const VIEWPORTS = [
  { name: "320", width: 320, height: 900 },
  { name: "768", width: 768, height: 900 },
  { name: "1440", width: 1440, height: 900 },
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

async function shot(page, file) {
  await page.screenshot({
    path: path.join(OUT, file),
    fullPage: true,
    type: "png",
    timeout: 120000,
    animations: "disabled",
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(90000);
    for (const route of ROUTES) {
      for (const theme of THEMES) {
        const file = `${route.slug}--${theme}.png`;
        const url = `${BASE}${route.path}`;
        console.log(`Capturing ${file} ← ${url}`);
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
        await applyTheme(page, theme);
        await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 });
        await page.waitForTimeout(800);
        await shot(page, file);
      }
    }
    await context.close();
  }

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(90000);
    for (const route of VIEWPORT_ROUTES) {
      const file = `viewport-${route.slug}--${vp.name}.png`;
      console.log(`Capturing ${file}`);
      await page.goto(`${BASE}${route.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
      await applyTheme(page, "light");
      await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 });
      await page.waitForTimeout(600);
      await shot(page, file);
    }
    await context.close();
  }

  await browser.close();
  console.log(`Done → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
