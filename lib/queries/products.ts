import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productImages, products, productVideos } from "@/db/schema";

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
    },
  });
}

export type ProductWithMedia = NonNullable<Awaited<ReturnType<typeof getProduct>>>;
export type ProductListRow = Awaited<ReturnType<typeof listProducts>>[number];
