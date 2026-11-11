/**
 * Public site smoke test: locale redirect, navigation, mobile menu, language switch, product page.
 *   pnpm e2e:site
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("e2e/output/site");
const log = (m: string) => console.log(`• ${m}`);

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const errors: string[] = [];
  try {
    // --- desktop ------------------------------------------------------------
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, locale: "zh-TW" });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => m.type() === "error" && !/compute-pressure/.test(m.text()) && errors.push(`console: ${m.text()}`));

    await page.goto(`${BASE_URL}/`);
    await page.waitForURL(/\/zh-TW$/);
    log("/ redirects by Accept-Language to /zh-TW");

    await page.getByRole("link", { name: "商品", exact: true }).first().click();
    await page.waitForURL(/\/zh-TW\/products$/);
    // Next.js keeps previously visited routes mounted (hidden), so only match visible elements.
    const cards = page.locator("main ul li a[href*='/products/']:visible");
    if ((await cards.count()) < 1) throw new Error("no product cards");
    await cards.first().click();
    await page.waitForURL(/\/zh-TW\/products\/[a-z0-9-]+$/);
    const h1 = page.getByRole("heading", { level: 1 });
    await h1.waitFor();
    log(`product page: ${await h1.innerText()}`);

    // language switch keeps the path
    await page.getByRole("link", { name: "DE", exact: true }).first().click();
    await page.waitForURL(/\/de\/products\/[a-z0-9-]+$/);
    log("locale switch keeps the product path");

    // cookie remembers the choice
    await page.goto(`${BASE_URL}/`);
    await page.waitForURL(/\/de$/);
    log("locale cookie is used on the next visit");

    // category sidebar link
    await page.goto(`${BASE_URL}/de/products`);
    await page.locator("nav[aria-label] ul a[href*='/categories/']:visible").first().click();
    await page.waitForURL(/\/de\/categories\//);
    log("category navigation works");
    await page.close();

    // --- mobile -------------------------------------------------------------
    const m = await browser.newPage({ viewport: { width: 390, height: 800 } });
    m.on("pageerror", (e) => errors.push(`pageerror(mobile): ${e.message}`));
    await m.goto(`${BASE_URL}/en`);
    await m.getByRole("button", { name: "Menu" }).click();
    const dialog = m.getByRole("dialog");
    await dialog.waitFor();
    if (!(await dialog.getByRole("button", { name: "Close" }).evaluate((el) => el === document.activeElement))) {
      throw new Error("close button is not focused when the menu opens");
    }
    await m.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    await m.getByRole("button", { name: "Menu" }).click();
    await dialog.getByRole("link", { name: "Products" }).click();
    await m.waitForURL(/\/en\/products$/);
    await dialog.waitFor({ state: "hidden" });
    log("mobile menu: focus, escape, navigation");

    const overflow = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) throw new Error(`horizontal overflow on mobile: ${overflow}px`);
    log("no horizontal overflow at 390px");
    await m.screenshot({ path: path.join(OUT, "mobile-products.png"), fullPage: true });
    await m.close();
  } finally {
    await browser.close();
  }
  if (errors.length) {
    console.warn(`\n${errors.length} browser error(s):`);
    for (const e of errors.slice(0, 5)) console.warn("  " + e);
    process.exit(1);
  }
  console.log("\nSite smoke test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
