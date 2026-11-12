/**
 * Screenshots pages at several widths for visual review.
 *   pnpm shoot /de /de/products          (BASE_URL defaults to http://localhost:3000)
 * Output: e2e/output/shots/<path>-<width>.png
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const WIDTHS = (process.env.WIDTHS ?? "390,820,1440").split(",").map(Number);
const OUT = path.resolve("e2e/output/shots");
const paths = process.argv.slice(2);
if (!paths.length) {
  console.error("usage: pnpm shoot /de /de/products …");
  process.exit(1);
}

async function main() {
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
if (process.env.LOGIN) {
  // Log in once (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD) so management pages can be captured.
  const login = await context.newPage();
  await login.goto(`${BASE_URL}/management/login`);
  await login.fill("#email", process.env.SEED_ADMIN_EMAIL ?? "");
  await login.fill("#password", process.env.SEED_ADMIN_PASSWORD ?? "");
  await login.click('button[type="submit"]');
  await login.waitForURL(/\/management(?!\/login)/);
  await login.close();
}
try {
  for (const p of paths) {
    for (const width of WIDTHS) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      await page.goto(`${BASE_URL}${p}`, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        // trigger reveal animations by scrolling through the page
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(800);
      const name = `${p.replace(/\//g, "_").replace(/^_/, "") || "home"}-${width}.png`;
      await page.screenshot({ path: path.join(OUT, name), fullPage: true });
      console.log(`${name}${errors.length ? `  ⚠ ${errors.length} console error(s): ${errors[0]}` : ""}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
