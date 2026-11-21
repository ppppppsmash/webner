"use server";

import { and, asc, eq, isNull, ne, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth/guard";
import { t } from "@/lib/i18n/admin";
import { slugFromName } from "@/lib/slug";
import { categoryFormSchema, type CategoryFormInput } from "@/lib/validation/category";
import { compactLocalized } from "@/lib/validation/localized";

const PATH = "/management/categories";

/** Position after the last sibling (a new category goes to the end of its level). */
async function nextSortOrder(parentId: string | null) {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${categories.sortOrder}), -1)` })
    .from(categories)
    .where(parentId ? eq(categories.parentId, parentId) : isNull(categories.parentId));
  return Number(row?.max ?? -1) + 1;
}

/**
 * Save the order from the category list (drag & drop). `orderedIds` is the list as shown;
 * each level (top-level categories, children of one parent) is renumbered 0..n-1 in that order.
 */
export async function reorderCategories(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z.array(z.uuid()).max(2000).safeParse(orderedIds);
  if (!parsed.success) return fail(t.common.somethingWentWrong);
  const rank = new Map([...new Set(parsed.data)].map((id, i) => [id, i]));

  await db.transaction(async (tx) => {
    const current = await tx
      .select({ id: categories.id, parentId: categories.parentId })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.createdAt));
    if (!current.length) return;
    // Categories the list did not know about (created in the meantime) keep their place at the end of their level.
    const sorted = current
      .map((c, i) => ({ ...c, key: rank.get(c.id) ?? rank.size + i }))
      .sort((a, b) => a.key - b.key);
    const counters = new Map<string, number>();
    const rows = sql.join(
      sorted.map((c) => {
        const level = c.parentId ?? "";
        const ord = counters.get(level) ?? 0;
        counters.set(level, ord + 1);
        return sql`(${c.id}::uuid, ${ord}::int)`;
      }),
      sql`, `,
    );
    // Raw SQL on purpose: only rows whose position changed are touched, and updated_at stays as it is.
    await tx.execute(
      sql`update ${categories} set sort_order = v.ord from (values ${rows}) as v(id, ord) where ${categories.id} = v.id and ${categories.sortOrder} <> v.ord`,
    );
  });

  revalidatePath(PATH);
  updateTag(CACHE_TAGS.categories);
  return ok(undefined);
}

export async function saveCategory(input: CategoryFormInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue?.message ?? t.common.somethingWentWrong, issue?.path.join("."));
  }
  const data = parsed.data;
  const name = compactLocalized(data.name);
  const slug = data.slug || slugFromName(name, "category");

  // A child cannot be its own parent and parents must be top-level (two levels max).
  let parentId = data.parentId;
  if (parentId) {
    if (parentId === data.id) parentId = null;
    else {
      const parent = await db.query.categories.findFirst({ where: eq(categories.id, parentId) });
      if (!parent || parent.parentId) return fail(t.common.somethingWentWrong, "parentId");
    }
  }

  const slugTaken = await db.query.categories.findFirst({
    where: data.id ? and(eq(categories.slug, slug), ne(categories.id, data.id)) : eq(categories.slug, slug),
  });
  if (slugTaken) return fail(t.categories.slugTaken, "slug");

  if (data.id) {
    // Becoming a child while having children would create a third level.
    if (parentId) {
      const hasChildren = await db.query.categories.findFirst({ where: eq(categories.parentId, data.id) });
      if (hasChildren) return fail(t.categories.hasChildren, "parentId");
    }
    // Moving to another level puts the category at the end of its new siblings; otherwise the position stays.
    const before = await db.query.categories.findFirst({ where: eq(categories.id, data.id), columns: { parentId: true } });
    const moved = (before?.parentId ?? null) !== parentId;
    await db
      .update(categories)
      .set({ name, slug, parentId, ...(moved ? { sortOrder: await nextSortOrder(parentId) } : {}) })
      .where(eq(categories.id, data.id));
    revalidatePath(PATH);
    updateTag(CACHE_TAGS.categories);
    return ok({ id: data.id });
  }

  const [row] = await db
    .insert(categories)
    .values({ name, slug, parentId, sortOrder: await nextSortOrder(parentId) })
    .returning({ id: categories.id });
  revalidatePath(PATH);
  updateTag(CACHE_TAGS.categories);
  return ok({ id: row.id });
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  const child = await db.query.categories.findFirst({ where: eq(categories.parentId, id) });
  if (child) return fail(t.categories.hasChildren);
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath(PATH);
  updateTag(CACHE_TAGS.categories);
  updateTag(CACHE_TAGS.products);
  return ok(undefined);
}
