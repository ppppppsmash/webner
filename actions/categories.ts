"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth/guard";
import { t } from "@/lib/i18n/admin";
import { slugFromName } from "@/lib/slug";
import { categoryFormSchema, type CategoryFormInput } from "@/lib/validation/category";
import { compactLocalized } from "@/lib/validation/localized";

const PATH = "/management/categories";

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
    await db
      .update(categories)
      .set({ name, slug, parentId, sortOrder: data.sortOrder })
      .where(eq(categories.id, data.id));
    revalidatePath(PATH);
    return ok({ id: data.id });
  }

  const [row] = await db
    .insert(categories)
    .values({ name, slug, parentId, sortOrder: data.sortOrder })
    .returning({ id: categories.id });
  revalidatePath(PATH);
  return ok({ id: row.id });
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  const child = await db.query.categories.findFirst({ where: eq(categories.parentId, id) });
  if (child) return fail(t.categories.hasChildren);
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath(PATH);
  return ok(undefined);
}
