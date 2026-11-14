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
  await page.waitForLoadState("networkidle");
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
    // HTML source toggle shows the markup and restores the editor
    await page.getByRole("button", { name: "HTML 原始碼" }).first().click();
    const source = await page.getByRole("textbox", { name: "HTML 原始碼" }).inputValue();
    if (!source.includes("<strong>重點</strong>")) throw new Error(`html source unexpected: ${source}`);
    await page.getByRole("button", { name: "HTML 原始碼" }).first().click();
    await page.locator(".tiptap").first().waitFor();

    // image upload (圖片與影片 tab)
    await page.getByRole("tab", { name: "圖片與影片" }).click();
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

    // category select + volume (分類與規格 tab), publish switch in the save bar
    await page.getByRole("tab", { name: "分類與規格" }).click();
    await page.locator('[data-slot="tabs-content"]:not([hidden])').getByRole("combobox").first().click();
    await page.getByRole("option", { name: `測試分類 ${stamp}` }).click();
    await page.fill("#volume", "100ml");
    // related products: pick the first candidate, chip appears with counter 1 / 4
    const relatedList = page.locator('[data-slot="tabs-content"]:not([hidden]) ul.max-h-56');
    await relatedList.getByRole("button").first().click();
    await page.getByText("1 / 4").waitFor();
    await page.getByRole("combobox", { name: "狀態" }).first().click(); // visibility in the save bar
    await page.getByRole("option", { name: "公開" }).click();
    await shot(page, "04-product-form");

    await page.getByRole("button", { name: "建立" }).first().click();
    await page.waitForURL(/\/management\/products\/[0-9a-f-]{36}$/);
    await page.getByText("商品已建立").waitFor();
    const productUrl = page.url();
    log(`product created: ${productUrl}`);
    await page.getByRole("tab", { name: "網址與 SEO" }).click();
    const productSlug = await page.inputValue("#slug");
    if (!productSlug) throw new Error("slug not generated");

    // reload edit page: data persisted?
    await page.goto(productUrl);
    // react-hook-form fills uncontrolled inputs after hydration, so poll for the value.
    await page.waitForFunction(
      (expected) => (document.querySelector('input[name="name.de"]') as HTMLInputElement | null)?.value === expected,
      `E2E Produkt ${stamp}`,
    );
    const html = await page.locator(".tiptap").first().innerHTML();
    await page.getByRole("tab", { name: "圖片與影片" }).click();
    await page.locator('img[src^="/uploads/images/"]').first().waitFor();
    if (!html.includes("<strong>重點</strong>")) throw new Error(`rich text not persisted: ${html}`);
    log("product persisted (name, image, rich text)");
    await shot(page, "05-product-edit");

    // scheduled go-live: published + future publishAt must not be reachable yet
    await page.getByRole("tab", { name: "設定" }).click();
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    await page.fill(
      "#publishAt",
      `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`,
    );
    await page.getByRole("button", { name: "儲存變更" }).first().click();
    await page.getByText("商品已更新").waitFor();
    // not-found renders inside the streamed shell (status stays 200), so check the body instead
    const scheduledHtml = await (await page.request.get(`${BASE_URL}/de/products/${productSlug}`)).text();
    if (scheduledHtml.includes(`E2E Produkt ${stamp}`)) throw new Error("scheduled product is visible before its publish time");
    // let the first toast disappear so the next wait sees the new one
    await page.getByText("商品已更新").waitFor({ state: "hidden", timeout: 15000 });
    await page.getByRole("button", { name: "清除" }).click();
    await page.getByRole("button", { name: "儲存變更" }).first().click();
    await page.getByText("商品已更新").waitFor();
    const liveHtml = await (await page.request.get(`${BASE_URL}/de/products/${productSlug}`)).text();
    if (!liveHtml.includes(`E2E Produkt ${stamp}`)) throw new Error("product should be live again after clearing publish time");
    log("scheduled publish gates the public page");

    // list shows product + inline visibility select (公開 → 隱藏)
    await page.goto(`${BASE_URL}/management/products`);
    await page.getByText(`測試商品 ${stamp}`).waitFor();
    const row = page.getByRole("row").filter({ hasText: `測試商品 ${stamp}` });
    await row.getByRole("combobox", { name: "狀態" }).click();
    await page.getByRole("option", { name: "隱藏" }).click();
    await row.getByRole("combobox", { name: "狀態" }).filter({ hasText: "隱藏" }).waitFor();
    // hidden product is still reachable by direct URL on the public site
    const hiddenHtml = await (await page.request.get(`${BASE_URL}/de/products/${productSlug}`)).text();
    if (!hiddenHtml.includes(`E2E Produkt ${stamp}`)) throw new Error("hidden product not reachable by direct URL");
    const listHtml = await (await page.request.get(`${BASE_URL}/de/products`)).text();
    if (listHtml.includes(`E2E Produkt ${stamp}`)) throw new Error("hidden product must not be listed");
    log("visibility changed to hidden, direct URL still works");
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

    // --- settings -----------------------------------------------------------
    await page.goto(`${BASE_URL}/management/settings`);
    await page.waitForFunction(() => (document.querySelector("#siteName") as HTMLInputElement | null)?.value !== "");
    await page.fill("#siteName", `webner ${stamp}`);
    await page.getByRole("button", { name: "儲存" }).click();
    await page.getByText("設定已儲存").waitFor();
    await page.reload();
    await page.waitForFunction(
      (expected) => (document.querySelector("#siteName") as HTMLInputElement | null)?.value === expected,
      `webner ${stamp}`,
    );
    await page.fill("#siteName", "webner");
    await page.getByRole("button", { name: "儲存" }).click();
    await page.getByText("設定已儲存").waitFor();
    log("settings saved");
    await shot(page, "07-settings");

    // --- admins: invite -> set password -> login as invitee ------------------
    const inviteeEmail = `e2e-${stamp}@example.com`;
    await page.goto(`${BASE_URL}/management/admins`);
    await page.getByRole("button", { name: "邀請管理員" }).click();
    await page.fill("#invite-email", inviteeEmail);
    await page.fill("#invite-name", "E2E Invitee");
    await page.getByRole("dialog").getByRole("button", { name: "邀請管理員" }).click();
    await page.getByText("邀請連結", { exact: true }).waitFor();
    const inviteUrl = await page.locator('input[readonly]').first().inputValue();
    if (!/\/management\/invite\/[a-f0-9]{64}$/.test(inviteUrl)) throw new Error(`unexpected invite url: ${inviteUrl}`);
    log("admin invited");
    await shot(page, "08-invite-link");
    await page.getByRole("dialog").getByRole("button", { name: "確認" }).click();

    // accept the invitation in a fresh (logged-out) context
    const guest = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const gpage = await guest.newPage();
    await gpage.goto(inviteUrl);
    await gpage.fill("#password", "invitee-pass-123");
    await gpage.fill("#passwordConfirm", "invitee-pass-123");
    await gpage.getByRole("button", { name: "完成設定" }).click();
    await gpage.waitForURL(/\/management\/login/);
    await gpage.fill("#email", inviteeEmail);
    await gpage.fill("#password", "invitee-pass-123");
    await gpage.click('button[type="submit"]');
    await gpage.waitForURL(/\/management$/);
    await gpage.goto(`${BASE_URL}/management/admins`);
    // a non-owner must not see the invite button
    if (await gpage.getByRole("button", { name: "邀請管理員" }).count()) throw new Error("invitee can see owner controls");
    log("invitee set password, logged in, owner controls hidden");
    await guest.close();

    // owner: disable, then delete the invitee
    await page.goto(`${BASE_URL}/management/admins`);
    const arow = page.getByRole("row").filter({ hasText: inviteeEmail });
    await arow.getByText("使用中").waitFor();
    await arow.getByRole("button", { name: "操作" }).click();
    await page.getByRole("menuitem", { name: "停用" }).click();
    await arow.getByText("已停用").waitFor();
    await arow.getByRole("button", { name: "操作" }).click();
    await page.getByRole("menuitem", { name: "刪除帳號" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "刪除" }).click();
    await page.getByText("帳號已刪除").waitFor();
    log("invitee disabled and deleted");

    // --- dashboard ----------------------------------------------------------
    await page.goto(`${BASE_URL}/management`);
    await page.getByText("商品總數").waitFor();
    await shot(page, "09-dashboard");
    log("dashboard ok");
  } catch (err) {
    console.error(`Failed at ${page.url()}`);
    await shot(page, "99-failure").catch(() => {});
    throw err;
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
