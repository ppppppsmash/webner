/**
 * Management smoke test (Playwright, headless Chromium).
 * Requires: dev server on BASE_URL (default http://localhost:3000) and a seeded owner
 * (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from .env).
 *
 *   pnpm e2e
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.SEED_ADMIN_EMAIL ?? "";
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "";
const OUT = process.env.E2E_OUT ?? path.resolve("e2e/output");

const log = (msg: string) => console.log(`• ${msg}`);

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
}

async function main() {
  if (!EMAIL || !PASSWORD) throw new Error("SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are required");
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });

  try {
    // --- login -------------------------------------------------------------
    await page.goto(`${BASE_URL}/management/products`);
    await page.waitForURL(/\/management\/login/);
    await shot(page, "01-login");
    await page.fill("#email", EMAIL);
    await page.fill("#password", "wrong-password");
    await page.click('button[type="submit"]');
    await page.getByText("電子郵件或密碼不正確").waitFor();
    log("wrong password is rejected");

    await page.fill("#password", PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/management\/products$/);
    log("login ok");
    await shot(page, "02-products-empty");

    // --- category -----------------------------------------------------------
    const stamp = Date.now().toString(36);
    await page.goto(`${BASE_URL}/management/categories/new`);
    await page.getByRole("tab", { name: "English" }).click();
    await page.fill('input[name="name.en"]', `E2E Category ${stamp}`);
    await page.getByRole("tab", { name: "繁體中文" }).click();
    await page.fill('input[name="name.zh-TW"]', `測試分類 ${stamp}`);
    await page.fill("#slug", `e2e-category-${stamp}`);
    await page.getByRole("button", { name: "建立" }).click();
    await page.waitForURL(/\/management\/categories$/);
    await page.getByText(`測試分類 ${stamp}`).waitFor();
    log("category created");
    await shot(page, "03-categories");

    // --- product ------------------------------------------------------------
    await page.goto(`${BASE_URL}/management/products/new`);
    await page.fill('input[name="name.de"]', `E2E Produkt ${stamp}`);
    await page.getByRole("tab", { name: "繁體中文" }).first().click();
    await page.fill('input[name="name.zh-TW"]', `測試商品 ${stamp}`);

    // rich text (zh-TW tab is active for description too, each LocalizedField has its own tabs)
    const editor = page.locator(".tiptap").first();
    await editor.click();
    await page.keyboard.type("這是商品說明。");
    await page.getByRole("button", { name: "粗體" }).first().click();
    await page.keyboard.type("重點");

    // image upload
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64",
    );
    const [chooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      page.getByRole("button", { name: "上傳圖片" }).click(),
    ]);
    await chooser.setFiles({ name: "e2e.png", mimeType: "image/png", buffer: png });
    await page.locator('img[src^="/uploads/images/"]').first().waitFor();
    log("image uploaded");

    // embed video
    await page.getByPlaceholder("https://www.youtube.com/watch?v=…").fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    await page.getByRole("button", { name: "加入影片網址" }).click();
    await page.getByText("外部連結").waitFor();

    // category select + volume + publish
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: `測試分類 ${stamp}` }).click();
    await page.fill("#volume", "100ml");
    await page.getByRole("switch").first().click(); // isPublished
    await shot(page, "04-product-form");

    await page.getByRole("button", { name: "建立" }).click();
    await page.waitForURL(/\/management\/products\/[0-9a-f-]{36}$/);
    await page.getByText("商品已建立").waitFor();
    const productUrl = page.url();
    log(`product created: ${productUrl}`);

    // reload edit page: data persisted?
    await page.goto(productUrl);
    await page.locator('input[name="name.de"]').waitFor();
    const de = await page.inputValue('input[name="name.de"]');
    if (de !== `E2E Produkt ${stamp}`) throw new Error(`name.de not persisted: ${de}`);
    await page.locator('img[src^="/uploads/images/"]').first().waitFor();
    const html = await page.locator(".tiptap").first().innerHTML();
    if (!html.includes("<strong>重點</strong>")) throw new Error(`rich text not persisted: ${html}`);
    log("product persisted (name, image, rich text)");
    await shot(page, "05-product-edit");

    // list shows product + publish switch
    await page.goto(`${BASE_URL}/management/products`);
    await page.getByText(`測試商品 ${stamp}`).waitFor();
    const row = page.getByRole("row").filter({ hasText: `測試商品 ${stamp}` });
    await row.getByRole("switch").click();
    await row.getByText("草稿").waitFor();
    log("publish switch toggled");
    await shot(page, "06-products-list");

    // delete product via row menu
    await row.getByRole("button", { name: "操作" }).click();
    await page.getByRole("menuitem", { name: "刪除" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "刪除" }).click();
    await page.getByText("商品已刪除").waitFor();
    log("product deleted");

    // delete category
    await page.goto(`${BASE_URL}/management/categories`);
    const crow = page.getByRole("row").filter({ hasText: `測試分類 ${stamp}` });
    await crow.getByRole("button", { name: "操作" }).click();
    await page.getByRole("menuitem", { name: "刪除" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "刪除" }).click();
    await page.getByText("分類已刪除").waitFor();
    log("category deleted");

    // logout
    await page.getByRole("button", { name: /^[A-Z]$|avatar/i }).first().click().catch(() => {});
  } finally {
    await writeFile(path.join(OUT, "browser-errors.log"), errors.join("\n"));
    await browser.close();
  }

  if (errors.length) {
    console.warn(`\n${errors.length} browser console error(s) recorded in e2e/output/browser-errors.log`);
    for (const e of errors.slice(0, 5)) console.warn("  " + e);
  }
  console.log("\nSmoke test passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
