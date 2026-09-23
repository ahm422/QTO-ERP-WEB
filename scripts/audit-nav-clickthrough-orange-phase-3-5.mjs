/**
 * Orange brand Phase 5 (#137) nav / footer / CTA click-through.
 * Usage: node scripts/audit-nav-clickthrough-orange-phase-3-5.mjs
 * Requires: npm run dev on http://localhost:3000
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

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  async function check(name, fn) {
    try {
      await fn();
      results.push({ name, status: "pass" });
      console.log(`PASS ${name}`);
    } catch (err) {
      results.push({ name, status: "fail", detail: String(err?.message || err) });
      console.log(`FAIL ${name} — ${err?.message || err}`);
    }
  }

  // Desktop checks
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    await check("desktop: home loads", async () => {
      const res = await page.goto(`${BASE}/`, {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      if (!res || res.status() >= 400) throw new Error(`status ${res?.status()}`);
    });

    await check("desktop: Contact nav", async () => {
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
      await page.locator('nav a[href="/contact"], footer a[href="/contact"]').first().click();
      await page.waitForURL("**/contact**", { timeout: 15000 });
    });

    await check("desktop: Demo CTA path", async () => {
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
      const demo = page.locator('a[href="/demo"]').first();
      await demo.click();
      await page.waitForURL("**/demo**", { timeout: 15000 });
    });

    await check("desktop: allApps from Platform", async () => {
      await page.goto(`${BASE}/allApps`, { waitUntil: "networkidle" });
      if (!page.url().includes("/allApps")) throw new Error(page.url());
    });

    await check("desktop: erp attendance", async () => {
      const res = await page.goto(`${BASE}/erp/attendance`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      if (!res || res.status() >= 400) throw new Error(`status ${res?.status()}`);
    });

    await check("footer: All Apps link", async () => {
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
      const link = page.locator('footer a[href="/allApps"]').first();
      await link.click();
      await page.waitForURL("**/allApps**", { timeout: 15000 });
    });

    await check("footer: FAQ anchor", async () => {
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
      const link = page.locator('footer a[href="/#faq"], footer a[href="#faq"]').first();
      if ((await link.count()) === 0) throw new Error("no FAQ footer link");
    });

    await context.close();
  }

  // Mobile drawer
  {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });

    await check("mobile: drawer opens", async () => {
      const toggle = page
        .locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], button:has-text("Menu")')
        .first();
      if ((await toggle.count()) === 0) {
        // fallback: hamburger often is first icon button in header
        await page.locator("header button, nav button").first().click();
      } else {
        await toggle.click();
      }
      await page.waitForTimeout(400);
    });

    await check("mobile: drawer → demo CTA", async () => {
      // Pinned drawer CTA (accent gradient button inside mobile panel)
      const drawerCta = page.locator(
        'div.fixed a[href="/demo"].flex.w-full, header a[href="/demo"].flex.w-full'
      ).first();
      await drawerCta.waitFor({ state: "visible", timeout: 10000 });
      await drawerCta.click({ force: true });
      await page.waitForURL("**/demo**", { timeout: 15000 });
    });

    await context.close();
  }

  await browser.close();
  const reportPath = path.join(OUT, "nav-clickthrough.json");
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
