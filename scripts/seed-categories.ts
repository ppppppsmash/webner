/**
 * Inserts the initial category tree (README 4.5) if it does not exist yet.
 * Usage: pnpm seed:categories
 */
import { eq } from "drizzle-orm";
import { db } from "../db";
import { categories } from "../db/schema";
import type { LocalizedText } from "../lib/i18n/locales";

type Node = { slug: string; name: LocalizedText; children?: Node[] };

const TREE: Node[] = [
  {
    slug: "face-care",
    name: { de: "Gesichtspflege", en: "Face Care", "zh-TW": "臉部保養", "zh-CN": "脸部保养" },
    children: [
      { slug: "cleansing", name: { de: "Reinigung", en: "Cleansing", "zh-TW": "卸妝/洗臉", "zh-CN": "卸妆/洗脸" } },
      { slug: "serum", name: { de: "Serum & Gesichtsöl", en: "Serum & Face Oil", "zh-TW": "精華液/精華油", "zh-CN": "精华液/精华油" } },
      { slug: "mask", name: { de: "Maske", en: "Mask", "zh-TW": "面膜", "zh-CN": "面膜" } },
      { slug: "eye-care", name: { de: "Augenpflege", en: "Eye Care", "zh-TW": "眼周保養", "zh-CN": "眼周保养" } },
    ],
  },
  {
    slug: "body-care",
    name: { de: "Körperpflege", en: "Body Care", "zh-TW": "身體保養", "zh-CN": "身体保养" },
    children: [
      { slug: "massage-oil", name: { de: "Massageöl", en: "Massage Oil", "zh-TW": "按摩油", "zh-CN": "按摩油" } },
      { slug: "intimate-care", name: { de: "Intimpflege", en: "Intimate Care", "zh-TW": "私密保養", "zh-CN": "私密保养" } },
    ],
  },
  {
    slug: "essential-oils",
    name: { de: "Ätherische Öle", en: "Essential Oils", "zh-TW": "植萃精油", "zh-CN": "植萃精油" },
    children: [
      { slug: "single-oils", name: { de: "Einzelöle", en: "Single Oils", "zh-TW": "單方精油", "zh-CN": "单方精油" } },
      { slug: "blends", name: { de: "Ölmischungen", en: "Blends", "zh-TW": "複方精油", "zh-CN": "复方精油" } },
      { slug: "absolutes", name: { de: "Absolues & Konzentrate", en: "Absolutes & Concentrates", "zh-TW": "原精/精油原液", "zh-CN": "原精/精油原液" } },
    ],
  },
  {
    slug: "home-living",
    name: { de: "Zuhause & Wohlbefinden", en: "Home & Living", "zh-TW": "居家生活", "zh-CN": "居家生活" },
    children: [
      { slug: "sprays", name: { de: "Sprays", en: "Sprays", "zh-TW": "噴霧", "zh-CN": "喷雾" } },
      { slug: "massage-tools", name: { de: "Massagewerkzeuge", en: "Massage Tools", "zh-TW": "按摩工具", "zh-CN": "按摩工具" } },
    ],
  },
];

async function upsert(node: Node, parentId: string | null, sortOrder: number) {
  const existing = await db.query.categories.findFirst({ where: eq(categories.slug, node.slug) });
  let id: string;
  if (existing) {
    id = existing.id;
    console.log(`skip   ${node.slug}`);
  } else {
    const [row] = await db
      .insert(categories)
      .values({ slug: node.slug, name: node.name, parentId, sortOrder })
      .returning({ id: categories.id });
    id = row.id;
    console.log(`insert ${node.slug}`);
  }
  for (const [i, child] of (node.children ?? []).entries()) {
    await upsert(child, id, i);
  }
}

async function main() {
  for (const [i, node] of TREE.entries()) {
    await upsert(node, null, i);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
