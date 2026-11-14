/**
 * Development only: inserts sample products (from the README product list) with
 * generated placeholder images so the public gallery can be reviewed before the
 * client enters real data. Safe to re-run; skips existing slugs.
 *
 *   pnpm seed:sample
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { chromium } from "playwright";
import { db } from "../db";
import { categories, media, productImages, products, productVideos } from "../db/schema";
import type { LocalizedText } from "../lib/i18n/locales";

type Sample = {
  slug: string;
  category: string; // category slug
  volume: string;
  tone: [string, string]; // bottle + liquid colors
  featured?: boolean;
  video?: string;
  name: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
};

const SAMPLES: Sample[] = [
  {
    slug: "white-rose-brightening-essence",
    category: "serum",
    volume: "100ml",
    tone: ["#f3e6e2", "#e9b7b0"],
    featured: true,
    name: { de: "Weiße Rose Aufhellende Essenz", en: "White Rose Brightening Essence", "zh-TW": "白玫瑰美白精萃", "zh-CN": "白玫瑰美白精萃" },
    summary: { de: "Zarte Rosenessenz für einen ebenmäßigen Teint.", en: "Delicate rose essence for an even, luminous complexion.", "zh-TW": "溫潤玫瑰精萃，均勻透亮膚色。", "zh-CN": "温润玫瑰精萃，均匀透亮肤色。" },
    description: {
      de: "<p>Die Weiße Rose Essenz verbindet Rosenwasser aus Damaszener-Rosen mit lichtreflektierenden Pflanzenextrakten.</p><h3>Anwendung</h3><p>Morgens und abends nach der Reinigung sanft in Gesicht und Hals einklopfen.</p>",
      en: "<p>White Rose Essence pairs Damask rose water with light-reflecting botanical extracts.</p><h3>How to use</h3><p>Pat gently onto face and neck after cleansing, morning and evening.</p>",
      "zh-TW": "<p>白玫瑰精萃結合大馬士革玫瑰純露與提亮植萃。</p><h3>使用方式</h3><p>早晚潔面後，輕拍於臉部與頸部。</p>",
      "zh-CN": "<p>白玫瑰精萃结合大马士革玫瑰纯露与提亮植萃。</p><h3>使用方式</h3><p>早晚洁面后，轻拍于面部与颈部。</p>",
    },
  },
  {
    slug: "rosewood-paradise-mist",
    category: "sprays",
    volume: "30ml",
    tone: ["#e8ecf4", "#b9c7e6"],
    name: { de: "Rosenholz Paradies-Spray", en: "Rosewood Paradise Mist", "zh-TW": "花梨木天堂噴霧", "zh-CN": "花梨木天堂喷雾" },
    summary: { de: "Ein Sprühstoß Ruhe für Raum und Haut.", en: "A spritz of calm for room and skin.", "zh-TW": "一噴，為空間與肌膚帶來寧靜。", "zh-CN": "一喷，为空间与肌肤带来宁静。" },
    description: { de: "<p>Rosenholz, Bergamotte und ein Hauch Vanille.</p>", en: "<p>Rosewood, bergamot and a whisper of vanilla.</p>", "zh-TW": "<p>花梨木、佛手柑與一抹香草。</p>", "zh-CN": "<p>花梨木、佛手柑与一抹香草。</p>" },
  },
  {
    slug: "double-rose-absolute",
    category: "absolutes",
    volume: "100ml",
    tone: ["#f6e3ea", "#d98aa6"],
    featured: true,
    name: { de: "Doppelte Rosen-Absolue", en: "Double Rose Absolute", "zh-TW": "2倍玫瑰原精萃", "zh-CN": "2倍玫瑰原精萃" },
    summary: { de: "Die doppelte Dosis Rose – intensiv und samtig.", en: "Twice the rose – intense and velvety.", "zh-TW": "雙倍玫瑰，濃郁絲滑。", "zh-CN": "双倍玫瑰，浓郁丝滑。" },
    description: { de: "<p>Absolue aus Rosa damascena und Rosa centifolia.</p>", en: "<p>Absolute from Rosa damascena and Rosa centifolia.</p>", "zh-TW": "<p>取自大馬士革玫瑰與千葉玫瑰的原精。</p>", "zh-CN": "<p>取自大马士革玫瑰与千叶玫瑰的原精。</p>" },
  },
  {
    slug: "blue-chamomile-repair-fluid",
    category: "serum",
    volume: "30ml",
    tone: ["#e2ecf3", "#6f9ec4"],
    featured: true,
    name: { de: "Blaue Kamille Repair-Fluid", en: "Blue Chamomile Repair Fluid", "zh-TW": "藍甘菊精油修護童顏液", "zh-CN": "蓝甘菊精油修护童颜液" },
    summary: { de: "Beruhigt gereizte Haut über Nacht.", en: "Calms irritated skin overnight.", "zh-TW": "夜間安撫敏感肌。", "zh-CN": "夜间安抚敏感肌。" },
    description: { de: "<p>Mit Chamazulen aus der blauen Kamille.</p>", en: "<p>With chamazulene from blue chamomile.</p>", "zh-TW": "<p>蘊含藍甘菊的天藍烴。</p>", "zh-CN": "<p>蕴含蓝甘菊的天蓝烃。</p>" },
  },
  {
    slug: "s-curve-massage-oil",
    category: "massage-oil",
    volume: "50ml",
    tone: ["#f4ead8", "#d9b56a"],
    video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    name: { de: "S-Kurve Massageöl", en: "S-Curve Massage Oil", "zh-TW": "S曲線按摩油", "zh-CN": "S曲线按摩油" },
    summary: { de: "Straffende Massage mit Grapefruit und Zypresse.", en: "Firming massage with grapefruit and cypress.", "zh-TW": "葡萄柚與絲柏的緊緻按摩。", "zh-CN": "葡萄柚与丝柏的紧致按摩。" },
    description: { de: "<p>Für die tägliche Körpermassage.</p>", en: "<p>For a daily body massage.</p>", "zh-TW": "<p>適合每日身體按摩。</p>", "zh-CN": "<p>适合每日身体按摩。</p>" },
  },
  {
    slug: "jasmine-eye-absolute",
    category: "eye-care",
    volume: "5ml",
    tone: ["#f1efe4", "#c9c27a"],
    name: { de: "Jasmin Augen-Absolue", en: "Jasmine Eye Absolute", "zh-TW": "超濃厚小花茉莉眼部專用原精", "zh-CN": "超浓厚小花茉莉眼部专用原精" },
    summary: { de: "Hochkonzentriert für die empfindliche Augenpartie.", en: "Highly concentrated care for the delicate eye area.", "zh-TW": "高濃度，專為眼周打造。", "zh-CN": "高浓度，专为眼周打造。" },
    description: { de: "<p>Jasminum sambac Absolue in Jojobaöl.</p>", en: "<p>Jasminum sambac absolute in jojoba oil.</p>", "zh-TW": "<p>小花茉莉原精融於荷荷芭油。</p>", "zh-CN": "<p>小花茉莉原精融于荷荷芭油。</p>" },
  },
  {
    slug: "frankincense-essential-oil",
    category: "single-oils",
    volume: "5ml",
    tone: ["#efe9df", "#a88b5c"],
    featured: true,
    name: { de: "Weihrauch Ätherisches Öl", en: "Frankincense Essential Oil", "zh-TW": "乳香單方精油", "zh-CN": "乳香单方精油" },
    summary: { de: "Harzig, warm, meditativ.", en: "Resinous, warm, meditative.", "zh-TW": "樹脂般溫暖、沉靜。", "zh-CN": "树脂般温暖、沉静。" },
    description: { de: "<p>Boswellia sacra, wasserdampfdestilliert.</p>", en: "<p>Boswellia sacra, steam distilled.</p>", "zh-TW": "<p>神聖乳香，蒸氣蒸餾。</p>", "zh-CN": "<p>神圣乳香，蒸汽蒸馏。</p>" },
  },
  {
    slug: "clary-sage-essential-oil",
    category: "single-oils",
    volume: "5ml",
    tone: ["#e9eee6", "#8aa37b"],
    name: { de: "Muskatellersalbei Ätherisches Öl", en: "Clary Sage Essential Oil", "zh-TW": "快樂鼠尾草單方精油", "zh-CN": "快乐鼠尾草单方精油" },
    summary: { de: "Krautig-süß, ausgleichend.", en: "Herbaceous-sweet, balancing.", "zh-TW": "草本甜香，平衡身心。", "zh-CN": "草本甜香，平衡身心。" },
    description: { de: "<p>Salvia sclarea aus Frankreich.</p>", en: "<p>Salvia sclarea from France.</p>", "zh-TW": "<p>來自法國的快樂鼠尾草。</p>", "zh-CN": "<p>来自法国的快乐鼠尾草。</p>" },
  },
  {
    slug: "dragon-blood-jasmine-mask",
    category: "mask",
    volume: "50ml",
    tone: ["#f2e4e0", "#c86b5a"],
    name: { de: "Drachenblut-Jasmin Maske", en: "Dragon Blood Jasmine Mask", "zh-TW": "龍血茉莉精油面膜", "zh-CN": "龙血茉莉精油面膜" },
    summary: { de: "Regenerierende Maske mit Drachenblut-Harz.", en: "Regenerating mask with dragon's blood resin.", "zh-TW": "龍血樹脂再生面膜。", "zh-CN": "龙血树脂再生面膜。" },
    description: { de: "<p>10 Minuten einwirken lassen.</p>", en: "<p>Leave on for 10 minutes.</p>", "zh-TW": "<p>敷 10 分鐘後洗淨。</p>", "zh-CN": "<p>敷 10 分钟后洗净。</p>" },
  },
  {
    slug: "jasmine-cleansing-oil",
    category: "cleansing",
    volume: "100ml",
    tone: ["#f3f0e4", "#d8cc8a"],
    name: { de: "Jasmin Reinigungsöl", en: "Jasmine Cleansing Oil", "zh-TW": "小花茉莉彈力卸妝精油", "zh-CN": "小花茉莉弹力卸妆精油" },
    summary: { de: "Löst Make-up, ohne die Haut auszutrocknen.", en: "Melts make-up without stripping the skin.", "zh-TW": "溫和卸妝，不帶走水分。", "zh-CN": "温和卸妆，不带走水分。" },
    description: { de: "<p>Auf trockener Haut einmassieren, mit Wasser emulgieren.</p>", en: "<p>Massage onto dry skin, emulsify with water.</p>", "zh-TW": "<p>乾手乾臉按摩，加水乳化後洗淨。</p>", "zh-CN": "<p>干手干脸按摩，加水乳化后洗净。</p>" },
  },
];

function bottleSvg(label: string, [glass, liquid]: [string, string], seed: number): string {
  const angle = (seed * 47) % 360;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#faf7f0"/><stop offset="1" stop-color="${glass}"/>
    </linearGradient>
    <linearGradient id="liq" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${liquid}" stop-opacity="0.75"/><stop offset="1" stop-color="${liquid}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.3" cy="0.2" r="0.8">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="1200" fill="url(#bg)"/>
  <g transform="rotate(${angle} 600 600)" opacity="0.18">
    <ellipse cx="600" cy="600" rx="520" ry="360" fill="${liquid}"/>
  </g>
  <ellipse cx="600" cy="1030" rx="260" ry="34" fill="#000" opacity="0.08"/>
  <g>
    <rect x="548" y="150" width="104" height="90" rx="14" fill="#2f3a2f"/>
    <rect x="536" y="232" width="128" height="26" rx="8" fill="#1f281f"/>
    <path d="M470 300 C470 270 500 258 530 258 H670 C700 258 730 270 730 300 V960 C730 1000 700 1020 660 1020 H540 C500 1020 470 1000 470 960 Z" fill="${glass}" stroke="#2f3a2f" stroke-opacity="0.12" stroke-width="4"/>
    <path d="M478 560 H722 V960 C722 996 696 1012 660 1012 H540 C504 1012 478 996 478 960 Z" fill="url(#liq)"/>
    <rect x="478" y="300" width="244" height="720" fill="url(#glow)" opacity="0.5"/>
    <rect x="500" y="620" width="200" height="200" rx="6" fill="#faf7f0" opacity="0.92"/>
    <text x="600" y="690" text-anchor="middle" font-family="Georgia, 'Noto Serif TC', serif" font-size="34" fill="#2f3a2f" letter-spacing="2">webner</text>
    <line x1="540" y1="712" x2="660" y2="712" stroke="#2f3a2f" stroke-opacity="0.4" stroke-width="2"/>
    <text x="600" y="760" text-anchor="middle" font-family="Georgia, 'Noto Serif TC', serif" font-size="22" fill="#2f3a2f">${label}</text>
  </g>
</svg>`;
}

async function main() {
  const uploadRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./uploads");
  const dir = path.join(uploadRoot, "images", "samples");
  await mkdir(dir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });

  try {
    for (const [i, s] of SAMPLES.entries()) {
      const exists = await db.query.products.findFirst({ where: eq(products.slug, s.slug), columns: { id: true } });
      if (exists) {
        console.log(`skip   ${s.slug}`);
        continue;
      }
      const cat = await db.query.categories.findFirst({ where: eq(categories.slug, s.category), columns: { id: true } });

      // Two placeholder images per product (front + alternate tint)
      const urls: string[] = [];
      for (const [j, tone] of [s.tone, [s.tone[1], s.tone[0]] as [string, string]].entries()) {
        const file = `${s.slug}-${j + 1}.png`;
        await page.setContent(`<html><body style="margin:0">${bottleSvg(s.name.en ?? s.slug, tone, i * 3 + j)}</body></html>`);
        const shot = await page.screenshot({ path: path.join(dir, file), clip: { x: 0, y: 0, width: 1200, height: 1200 } });
        const url = `/uploads/images/samples/${file}`;
        urls.push(url);
        await db
          .insert(media)
          .values({ kind: "image", key: `images/samples/${file}`, url, fileName: file, contentType: "image/png", size: shot.byteLength })
          .onConflictDoNothing();
      }

      const [row] = await db
        .insert(products)
        .values({
          slug: s.slug,
          name: s.name,
          summary: s.summary,
          description: s.description,
          categoryId: cat?.id ?? null,
          volume: s.volume,
          externalUrl: "https://www.japanaceshop.com/categories/webner",
          visibility: "published",
          isFeatured: Boolean(s.featured),
          sortOrder: i,
        })
        .returning({ id: products.id });

      await db.insert(productImages).values(urls.map((url, j) => ({ productId: row.id, url, sortOrder: j, isMain: j === 0 })));
      if (s.video) {
        await db.insert(productVideos).values({ productId: row.id, kind: "embed", url: s.video, title: s.name.en ?? null, sortOrder: 0 });
      }
      console.log(`insert ${s.slug}`);
    }
  } finally {
    await browser.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
