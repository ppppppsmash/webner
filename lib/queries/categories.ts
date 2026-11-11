import "server-only";
import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import type { Category } from "@/db/schema";

export type CategoryRow = Category & { productCount: number; parent: Category | null };

export async function listCategories(): Promise<CategoryRow[]> {
  const rows = await db.query.categories.findMany({
    with: { parent: true },
    orderBy: [asc(categories.sortOrder), asc(categories.createdAt)],
  });
  const counts = await db
    .select({ categoryId: products.categoryId, n: count() })
    .from(products)
    .groupBy(products.categoryId);
  const byId = new Map(counts.map((c) => [c.categoryId, Number(c.n)]));

  // Order: parent, then its children, so the list reads as a tree.
  const parents = rows.filter((r) => !r.parentId);
  const ordered: typeof rows = [];
  for (const p of parents) {
    ordered.push(p, ...rows.filter((r) => r.parentId === p.id));
  }
  // Orphans (parent deleted) go last.
  for (const r of rows) if (!ordered.includes(r)) ordered.push(r);

  return ordered.map((r) => ({ ...r, productCount: byId.get(r.id) ?? 0 }));
}

export async function getCategory(id: string) {
  return db.query.categories.findFirst({ where: eq(categories.id, id) });
}

/** Top-level categories, usable as a parent. */
export async function listParentCategories() {
  return db.query.categories.findMany({
    where: (c, { isNull }) => isNull(c.parentId),
    orderBy: [asc(categories.sortOrder), asc(categories.createdAt)],
  });
}

/** Flat list with depth, for selects: parent followed by its children. */
export async function listCategoryOptions() {
  const rows = await db.query.categories.findMany({
    orderBy: [asc(categories.sortOrder), asc(categories.createdAt)],
  });
  const out: Array<Category & { depth: number }> = [];
  for (const p of rows.filter((r) => !r.parentId)) {
    out.push({ ...p, depth: 0 });
    for (const c of rows.filter((r) => r.parentId === p.id)) out.push({ ...c, depth: 1 });
  }
  return out;
}
