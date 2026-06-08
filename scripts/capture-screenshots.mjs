// Screenshot capture for Multi-Agent Command Center
import { chromium } from "playwright";

const BASE = process.env.SCREENSHOT_URL ?? "http://127.0.0.1:3108";
const OUT = "docs/screenshots";

async function capture(label, options = {}) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  if (options.scrollY) {
    await page.evaluate(y => window.scrollTo(0, y), options.scrollY);
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: `${OUT}/${label}.png`, fullPage: options.fullPage ?? false });
  console.log(`Captured: ${label}.png`);
  await browser.close();
}

async function main() {
  // Full page
  await capture("00-full-page", { fullPage: true });
  // Hero section
  await capture("01-dashboard-hero");
  // Agent workers grid (scroll to it)
  await capture("02-agent-observability-grid", { scrollY: 700 });
  // Drift detection + cost
  await capture("03-drift-detection-cost", { scrollY: 1700 });
  // Artifact review + audit log
  await capture("04-artifact-review-audit", { scrollY: 2800 });
  // Loop detection detail (halted agent card)
  await capture("05-loop-detection-detail", { scrollY: 1000 });
  // Cost tracking panel
  await capture("06-cost-tracking-panel", { scrollY: 1900 });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
