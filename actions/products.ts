"use server";

import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { db } from "@/db";
import { productCategories, productImages, productRelations, products, productVideos } from "@/db/schema";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth/guard";
import { t } from "@/lib/i18n/admin";
import { slugFromName } from "@/lib/slug";
import type { ProductVisibility } from "@/lib/product-visibility";
import { PRODUCT_VISIBILITIES } from "@/lib/product-visibility";
import { compactLocalized, compactRichText } from "@/lib/validation/localized";
import { productFormSchema, type ProductFormInput } from "@/lib/validation/product";

const PATH = "/management/products";

export async function saveProduct(input: ProductFormInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue?.message ?? t.common.somethingWentWrong, issue?.path.join("."));
  }
  const data = parsed.data;
  const name = compactLocalized(data.name);
  const slug = data.slug || slugFromName(name, "product");

  const slugTaken = await db.query.products.findFirst({
    where: data.id ? and(eq(products.slug, slug), ne(products.id, data.id)) : eq(products.slug, slug),
    columns: { id: true },
  });
  if (slugTaken) return fail(t.products.slugTaken, "slug");

  const values = {
    name,
    summary: compactLocalized(data.summary),
    seoTitle: compactLocalized(data.seoTitle),
    seoDescription: compactLocalized(data.seoDescription),
    description: compactRichText(data.description),
    slug,
    volume: data.volume || null,
    externalUrl: data.externalUrl || null,
    visibility: data.visibility,
    publishAt: data.publishAt ? new Date(data.publishAt) : null,
    isFeatured: data.isFeatured,
    badge: data.badge,
    tags: [...new Set(data.tags.map((tag) => tag.trim()).filter(Boolean))],
  };

  const id = await db.transaction(async (tx) => {
    let productId = data.id;
    if (productId) {
      await tx.update(products).set(values).where(eq(products.id, productId));
      await tx.delete(productImages).where(eq(productImages.productId, productId));
      await tx.delete(productVideos).where(eq(productVideos.productId, productId));
      await tx.delete(productRelations).where(eq(productRelations.productId, productId));
      await tx.delete(productCategories).where(eq(productCategories.productId, productId));
    } else {
      // A new product goes to the top of the list; the position is changed by dragging in the list.
      const [first] = await tx.select({ min: sql<number>`coalesce(min(${products.sortOrder}), 1)` }).from(products);
      const [row] = await tx
        .insert(products)
        .values({ ...values, sortOrder: Number(first?.min ?? 1) - 1 })
        .returning({ id: products.id });
      productId = row.id;
    }

    if (data.images.length) {
      await tx.insert(productImages).values(
        data.images.map((img, i) => ({
          productId: productId as string,
          url: img.url,
          alt: img.alt || null,
          sortOrder: i,
          isMain: i === 0,
        })),
      );
    }
    if (data.videos.length) {
      await tx.insert(productVideos).values(
        data.videos.map((v, i) => ({
          productId: productId as string,
          kind: v.kind,
          url: v.url,
          title: v.title || null,
          sortOrder: i,
        })),
      );
    }
    const categoryIds = [...new Set(data.categoryIds)];
    if (categoryIds.length) {
      await tx.insert(productCategories).values(
        categoryIds.map((cid, i) => ({ productId: productId as string, categoryId: cid, sortOrder: i })),
      );
    }
    const relatedIds = [...new Set(data.relatedIds)].filter((rid) => rid !== productId);
    if (relatedIds.length) {
      await tx.insert(productRelations).values(
        relatedIds.map((rid, i) => ({ productId: productId as string, relatedId: rid, sortOrder: i })),
      );
    }
    return productId as string;
  });

  revalidatePath(PATH);
  revalidatePath(`${PATH}/${id}`);
  updateTag(CACHE_TAGS.products);
  updateTag(CACHE_TAGS.product(id));
  return ok({ id });
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();

  // Uploaded files stay in the media library (they may be reused by other products);
  // they are removed from the library page instead.
  await db.delete(products).where(eq(products.id, id));

  revalidatePath(PATH);
  updateTag(CACHE_TAGS.products);
  updateTag(CACHE_TAGS.product(id));
  return ok(undefined);
}

/**
 * Save the list order (drag & drop in the product list). `orderedIds` is the whole list, first = first on the site.
 * Positions are renumbered 0..n-1, so there are never gaps or duplicates.
 */
export async function reorderProducts(orderedIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z.array(z.uuid()).max(5000).safeParse(orderedIds);
  if (!parsed.success) return fail(t.common.somethingWentWrong);
  const given = [...new Set(parsed.data)];

  await db.transaction(async (tx) => {
    const current = await tx
      .select({ id: products.id })
      .from(products)
      .orderBy(asc(products.sortOrder), desc(products.createdAt));
    const known = new Set(current.map((r) => r.id));
    const wanted = given.filter((id) => known.has(id));
    const listed = new Set(wanted);
    // Products the list did not know about (created in the meantime) stay in front, like any new product.
    const next = [...current.map((r) => r.id).filter((id) => !listed.has(id)), ...wanted];
    if (!next.length) return;
    const rows = sql.join(
      next.map((id, i) => sql`(${id}::uuid, ${i}::int)`),
      sql`, `,
    );
    // Raw SQL on purpose: only rows whose position changed are touched, and updated_at stays as it is.
    await tx.execute(
      sql`update ${products} set sort_order = v.ord from (values ${rows}) as v(id, ord) where ${products.id} = v.id and ${products.sortOrder} <> v.ord`,
    );
  });

  revalidatePath(PATH);
  updateTag(CACHE_TAGS.products);
  return ok(undefined);
}

export async function setProductVisibility(id: string, visibility: ProductVisibility): Promise<ActionResult> {
  await requireAdmin();
  if (!PRODUCT_VISIBILITIES.includes(visibility)) return fail(t.common.somethingWentWrong);
  await db.update(products).set({ visibility }).where(eq(products.id, id));
  revalidatePath(PATH);
  updateTag(CACHE_TAGS.products);
  updateTag(CACHE_TAGS.product(id));
  return ok(undefined);
}
