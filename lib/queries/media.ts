import "server-only";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { media, productImages, products, productVideos } from "@/db/schema";
import { pickText } from "@/lib/i18n/locales";

export type MediaUsage = { id: string; name: string };

/** Products (id + zh-TW name) referencing each media URL. */
async function usageByUrl(urls: string[]): Promise<Map<string, MediaUsage[]>> {
  const map = new Map<string, MediaUsage[]>();
  if (!urls.length) return map;
  const [imageRows, videoRows] = await Promise.all([
    db
      .select({ url: productImages.url, id: products.id, name: products.name })
      .from(productImages)
      .innerJoin(products, eq(productImages.productId, products.id))
      .where(inArray(productImages.url, urls)),
    db
      .select({ url: productVideos.url, id: products.id, name: products.name })
      .from(productVideos)
      .innerJoin(products, eq(productVideos.productId, products.id))
      .where(inArray(productVideos.url, urls)),
  ]);
  for (const r of [...imageRows, ...videoRows]) {
    const list = map.get(r.url) ?? [];
    if (!list.some((p) => p.id === r.id)) list.push({ id: r.id, name: pickText(r.name, "zh-TW") || pickText(r.name, "de") });
    map.set(r.url, list);
  }
  return map;
}

/** All library files, newest first, with the products using each one. */
export async function listMedia() {
  const rows = await db.query.media.findMany({ orderBy: [desc(media.createdAt)] });
  const usage = await usageByUrl(rows.map((r) => r.url));
  return rows.map((r) => ({ ...r, products: usage.get(r.url) ?? [] }));
}

export async function getMediaUsage(url: string): Promise<MediaUsage[]> {
  return (await usageByUrl([url])).get(url) ?? [];
}

export type MediaRow = Awaited<ReturnType<typeof listMedia>>[number];
