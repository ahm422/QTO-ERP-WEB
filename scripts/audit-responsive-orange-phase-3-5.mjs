/**
 * Orange brand Phase 5 (#137) responsive overflow audit.
 * Usage: node scripts/audit-responsive-orange-phase-3-5.mjs
 * Requires: npm run dev on http://localhost:3000
 *
 * Writes docs/baseline-screenshots/marketing-orange-phase-3-5/responsive-matrix.json
 * Does not overwrite marketing-phase-9/ or palette-phase-4/ archives.
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
  { slug: "home", path: "/", expectShell: true },
  { slug: "allApps", path: "/allApps", expectShell: true },
  { slug: "erp-attendance", path: "/erp/attendance", expectShell: true },
  { slug: "solution-hr-teams", path: "/solution/hr-teams", expectShell: true },
  { slug: "about", path: "/about", expectShell: true },
  { slug: "blog", path: "/blog", expectShell: true },
  { slug: "blog-post", path: "/blog/why-growing-teams-need-erp", expectShell: true },
  { slug: "contact", path: "/contact", expectShell: true },
  { slug: "demo", path: "/demo", expectShell: true },
  { slug: "style-guide", path: "/style-guide", expectShell: false },
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
          await page.screenshot({
            path: path.join(FAIL_DIR, `${route.slug}--${width}.png`),
            fullPage: true,
            type: "png",
          });
        }

        if (route.expectShell) {
          const hasNav = await page.locator("nav").first().count();
          const hasFooter = await page.locator("footer").first().count();
          if (!hasNav || !hasFooter) {
            status = "fail";
            detail =
              `${detail} missing shell nav=${hasNav} footer=${hasFooter}`.trim();
          }
        }
      } catch (err) {
        status = "fail";
        detail = String(err?.message || err);
      }

      results.push({
        width,
        route: route.slug,
        path: route.path,
        status,
        detail,
      });
      console.log(
        `${status.toUpperCase()} ${width}×900 ${route.slug}${detail ? ` — ${detail}` : ""}`
      );
    }

    await context.close();
  }

  await browser.close();

  const reportPath = path.join(OUT, "responsive-matrix.json");
  await writeFile(
    reportPath,
    JSON.stringify({ capturedAt: new Date().toISOString(), results }, null, 2)
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
