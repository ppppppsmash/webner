import "server-only";
import { and, asc, count, desc, eq, gt, isNull, lte, ne, or, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { categories, productImages, products, productVideos } from "@/db/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getSiteSettings } from "@/lib/settings";

/** Published, and the scheduled go-live time (if any) has passed. */
const PUBLISHED = and(
  eq(products.visibility, "published"),
  or(isNull(products.publishAt), lte(products.publishAt, sql`now()`)),
);
/** Detail pages are also reachable for hidden products (direct link only, not gated by publish_at). */
const REACHABLE = or(PUBLISHED, eq(products.visibility, "hidden"));
/** Published products whose go-live time is still in the future (used to shorten the cache). */
const SCHEDULED = and(eq(products.visibility, "published"), gt(products.publishAt, sql`now()`));

/** Shorter cache while a scheduled go-live is pending so it appears within minutes. Call once per cached function. */
async function productsCacheLife() {
  const [row] = await db.select({ n: count() }).from(products).where(SCHEDULED);
  if (Number(row?.n ?? 0) > 0) cacheLife("minutes");
  else cacheLife("hours");
}

const productListWith = {
  category: { with: { parent: true as const } },
  images: { orderBy: [asc(productImages.sortOrder)], limit: 2 },
};

export async function getPublishedProducts() {
  "use cache";
  await productsCacheLife();
  cacheTag(CACHE_TAGS.products);
  return db.query.products.findMany({
    where: PUBLISHED,
    with: productListWith,
    orderBy: [asc(products.sortOrder), desc(products.createdAt)],
  });
}

export async function getFeaturedProducts(limit = 6) {
  "use cache";
  await productsCacheLife();
  cacheTag(CACHE_TAGS.products);
  return db.query.products.findMany({
    where: and(PUBLISHED, eq(products.isFeatured, true)),
    with: productListWith,
    orderBy: [asc(products.sortOrder), desc(products.createdAt)],
    limit,
  });
}

export async function getLatestProducts(limit = 8) {
  "use cache";
  await productsCacheLife();
  cacheTag(CACHE_TAGS.products);
  return db.query.products.findMany({
    where: PUBLISHED,
    with: productListWith,
    orderBy: [desc(products.createdAt)],
    limit,
  });
}

export async function getPublishedProductBySlug(slug: string) {
  "use cache";
  await productsCacheLife();
  cacheTag(CACHE_TAGS.products);
  const product = await db.query.products.findFirst({
    where: and(REACHABLE, eq(products.slug, slug)),
    with: {
      category: { with: { parent: true } },
      images: { orderBy: [asc(productImages.sortOrder)] },
      videos: { orderBy: [asc(productVideos.sortOrder)] },
    },
  });
  if (product) cacheTag(CACHE_TAGS.product(product.id));
  return product ?? null;
}

export async function getRelatedProducts(productId: string, categoryId: string | null, limit = 4) {
  "use cache";
  await productsCacheLife();
  cacheTag(CACHE_TAGS.products);
  if (!categoryId) return [];
  return db.query.products.findMany({
    where: and(PUBLISHED, eq(products.categoryId, categoryId), ne(products.id, productId)),
    with: productListWith,
    orderBy: [asc(products.sortOrder), desc(products.createdAt)],
    limit,
  });
}

/** Category tree with published-product counts (children nested under parents). */
export async function getCategoryTree() {
  "use cache";
  await productsCacheLife();
  cacheTag(CACHE_TAGS.categories, CACHE_TAGS.products);
  const [rows, published] = await Promise.all([
    db.query.categories.findMany({ orderBy: [asc(categories.sortOrder), asc(categories.createdAt)] }),
    db.query.products.findMany({ where: PUBLISHED, columns: { categoryId: true } }),
  ]);
  const counts = new Map<string, number>();
  for (const p of published) {
    if (p.categoryId) counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
  }
  const parents = rows.filter((r) => !r.parentId);
  return parents.map((parent) => {
    const children = rows
      .filter((r) => r.parentId === parent.id)
      .map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }));
    const own = counts.get(parent.id) ?? 0;
    return { ...parent, count: own + children.reduce((n, c) => n + c.count, 0), children };
  });
}

export type CategoryTree = Awaited<ReturnType<typeof getCategoryTree>>;
export type CategoryNode = CategoryTree[number];

export async function getCategoryBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.categories);
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
    with: { parent: true, children: true },
  });
  return category ?? null;
}

/** Products of a category; a parent category includes its children's products. */
export async function getProductsByCategory(categoryId: string, childIds: string[]) {
  "use cache";
  await productsCacheLife();
  cacheTag(CACHE_TAGS.products, CACHE_TAGS.categories);
  const ids = new Set([categoryId, ...childIds]);
  const rows = await db.query.products.findMany({
    where: PUBLISHED,
    with: productListWith,
    orderBy: [asc(products.sortOrder), desc(products.createdAt)],
  });
  return rows.filter((p) => p.categoryId && ids.has(p.categoryId));
}

export async function getPublicSettings() {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.settings);
  return getSiteSettings();
}

export type PublicProduct = Awaited<ReturnType<typeof getPublishedProducts>>[number];
export type PublicProductDetail = NonNullable<Awaited<ReturnType<typeof getPublishedProductBySlug>>>;
