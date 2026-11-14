import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pickText } from "@/lib/i18n/locales";
import { productImages, productRelations, products, productVideos } from "@/db/schema";

export async function listProducts() {
  return db.query.products.findMany({
    with: {
      category: { with: { parent: true } },
      images: { orderBy: [asc(productImages.sortOrder)], limit: 1 },
    },
    orderBy: [asc(products.sortOrder), desc(products.updatedAt)],
  });
}

export async function getProduct(id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      images: { orderBy: [asc(productImages.sortOrder)] },
      videos: { orderBy: [asc(productVideos.sortOrder)] },
      related: { orderBy: [asc(productRelations.sortOrder)] },
    },
  });
}

/** Lightweight rows for the related-product picker. */
export async function listProductOptions(excludeId?: string) {
  const rows = await db.query.products.findMany({
    columns: { id: true, name: true },
    with: { images: { orderBy: [asc(productImages.sortOrder)], limit: 1, columns: { url: true } } },
    orderBy: [asc(products.sortOrder), desc(products.updatedAt)],
  });
  return rows
    .filter((r) => r.id !== excludeId)
    .map((r) => ({
      id: r.id,
      name: pickText(r.name, "zh-TW"),
      nameDe: pickText(r.name, "de"),
      imageUrl: r.images[0]?.url ?? null,
    }));
}

export type ProductWithMedia = NonNullable<Awaited<ReturnType<typeof getProduct>>>;
export type ProductListRow = Awaited<ReturnType<typeof listProducts>>[number];
