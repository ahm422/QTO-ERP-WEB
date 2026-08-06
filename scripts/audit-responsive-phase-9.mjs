/**
 * Phase 9 (#131) responsive overflow + shell audit.
 * Usage: node scripts/audit-responsive-phase-9.mjs
 * Requires: npm run dev on http://localhost:3000
 *
 * Checks document scrollWidth vs clientWidth across viewport × route matrix.
 * Optionally writes failure screenshots under docs/baseline-screenshots/marketing-phase-9/failures/
 */
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs/baseline-screenshots/marketing-phase-9");
const FAIL_DIR = path.join(OUT, "failures");
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

const WIDTHS = [320, 375, 414, 768, 1024, 1280, 1440, 1920];
const ROUTES = [
  { slug: "home", path: "/" },
  { slug: "allApps", path: "/allApps" },
  { slug: "erp-attendance", path: "/erp/attendance" },
  { slug: "solution-hr-teams", path: "/solution/hr-teams" },
  { slug: "pricing", path: "/pricing" },
  { slug: "about", path: "/about" },
  { slug: "blog", path: "/blog" },
  { slug: "blog-post", path: "/blog/why-growing-teams-need-erp" },
  { slug: "contact", path: "/contact" },
  { slug: "demo", path: "/demo" },
];

async function main() {
  await mkdir(OUT, { recursive: true });
  await mkdir(FAIL_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();

    for (const route of ROUTES) {
      const url = `${BASE}${route.path}`;
      let status = "pass";
      let detail = "";
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
        await page.waitForTimeout(300);
        const metrics = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          return {
            scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
            clientWidth: doc.clientWidth,
            overflowX: getComputedStyle(body).overflowX,
          };
        });
        const overflow = metrics.scrollWidth > metrics.clientWidth + 1;
        if (overflow) {
          status = "fail";
          detail = `scrollWidth=${metrics.scrollWidth} clientWidth=${metrics.clientWidth}`;
          const file = `${route.slug}--${width}.png`;
          await page.screenshot({
            path: path.join(FAIL_DIR, file),
            fullPage: true,
            type: "png",
          });
        }

        // Shell presence
        const hasNav = await page.locator("nav").first().count();
        const hasFooter = await page.locator("footer").first().count();
        if (!hasNav || !hasFooter) {
          status = "fail";
          detail = `${detail} missing shell nav=${hasNav} footer=${hasFooter}`.trim();
        }
      } catch (err) {
        status = "fail";
        detail = String(err?.message || err);
      }

      const row = { width, route: route.slug, path: route.path, status, detail };
      results.push(row);
      console.log(
        `${status.toUpperCase()} ${width}×900 ${route.slug}${detail ? ` — ${detail}` : ""}`
      );
    }

    await context.close();
  }

  await browser.close();

  const reportPath = path.join(OUT, "responsive-matrix.json");
  await writeFile(reportPath, JSON.stringify({ capturedAt: new Date().toISOString(), results }, null, 2));
  const fails = results.filter((r) => r.status === "fail");
  console.log(`\nDone → ${reportPath}`);
  console.log(`Pass: ${results.length - fails.length} / ${results.length}; Fail: ${fails.length}`);
  if (fails.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
