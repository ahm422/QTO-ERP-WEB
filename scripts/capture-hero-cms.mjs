/**
 * Home hero CMS (#143) baseline screenshots.
 * Usage: node scripts/capture-hero-cms.mjs
 * Requires: npm run dev on http://localhost:3000 (or BASE_URL)
 *
 * Optional: PLAYWRIGHT_BROWSERS_PATH if Chromium isn't in the default cache.
 *
 * Writes docs/baseline-screenshots/hero-cms/
 * Does not overwrite marketing-home-visual-phase/ or older archives.
 */
import { createRequire } from "node:module";
import { existsSync, readdirSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs/baseline-screenshots/hero-cms");
const BASE = process.env.BASE_URL || "http://localhost:3000";

const require = createRequire(import.meta.url);

/** Prefer a browsers cache that matches the loaded Playwright revision. */
function ensureBrowsersPath() {
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) return;
  const candidates = [];
  const cacheRoot = "/tmp/cursor-sandbox-cache";
  if (existsSync(cacheRoot)) {
    for (const entry of readdirSync(cacheRoot)) {
      candidates.push(path.join(cacheRoot, entry, "playwright"));
    }
  }
  candidates.push("/tmp/pw-palette/browsers");
  for (const dir of candidates) {
    if (existsSync(path.join(dir, "chromium_headless_shell-1169"))) {
      process.env.PLAYWRIGHT_BROWSERS_PATH = dir;
      return;
    }
  }
}

function loadPlaywright() {
  ensureBrowsersPath();
  try {
    return require("/tmp/pw-palette/node_modules/playwright");
  } catch {
    return require("playwright");
  }
}
const { chromium } = loadPlaywright();

const THEMES = ["light", "dark"];
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

async function shot(page, file, clip) {
  await page.screenshot({
    path: path.join(OUT, file),
    fullPage: !clip,
    clip,
    type: "png",
    timeout: 120000,
    animations: "disabled",
  });
}

async function captureHome(page, theme, file, { heroOnly = false } = {}) {
  const url = `${BASE}/`;
  console.log(`Capturing ${file} ← ${url} (${theme})`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await applyTheme(page, theme);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(800);

  if (heroOnly) {
    const hero = page.locator("section").first();
    const box = await hero.boundingBox();
    if (box) {
      await shot(page, file, {
        x: Math.max(0, box.x),
        y: Math.max(0, box.y),
        width: Math.min(box.width, page.viewportSize()?.width ?? box.width),
        height: Math.min(box.height, 900),
      });
      return;
    }
  }
  await shot(page, file);
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
    for (const theme of THEMES) {
      await captureHome(page, theme, `home--${theme}.png`);
      await captureHome(page, theme, `hero--${theme}.png`, { heroOnly: true });
    }
    await context.close();
  }

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      reducedMotion: "reduce",
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(90000);
    await captureHome(page, "light", `viewport-hero--${vp.name}.png`, {
      heroOnly: true,
    });
    await captureHome(page, "dark", `viewport-hero-dark--${vp.name}.png`, {
      heroOnly: true,
    });
    await context.close();
  }

  await browser.close();
  console.log(`Done → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
