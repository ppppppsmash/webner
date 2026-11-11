import "server-only";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { admins, categories, products } from "@/db/schema";

export async function getDashboardStats() {
  const [[p], [pub], [c], [a]] = await Promise.all([
    db.select({ n: count() }).from(products),
    db.select({ n: count() }).from(products).where(eq(products.isPublished, true)),
    db.select({ n: count() }).from(categories),
    db.select({ n: count() }).from(admins),
  ]);
  return {
    products: Number(p?.n ?? 0),
    published: Number(pub?.n ?? 0),
    categories: Number(c?.n ?? 0),
    admins: Number(a?.n ?? 0),
  };
}

export async function getRecentProducts(limit = 5) {
  return db.query.products.findMany({
    orderBy: [desc(products.updatedAt)],
    limit,
    with: { category: true },
  });
}
