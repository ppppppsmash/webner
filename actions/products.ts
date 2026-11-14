"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { db } from "@/db";
import { productImages, products, productVideos } from "@/db/schema";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth/guard";
import { t } from "@/lib/i18n/admin";
import { slugFromName } from "@/lib/slug";
import { getStorage, keyFromLocalUrl } from "@/lib/storage";
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
    categoryId: data.categoryId,
    volume: data.volume || null,
    externalUrl: data.externalUrl || null,
    visibility: data.visibility,
    publishAt: data.publishAt ? new Date(data.publishAt) : null,
    isFeatured: data.isFeatured,
    badge: data.badge,
    sortOrder: data.sortOrder,
  };

  const id = await db.transaction(async (tx) => {
    let productId = data.id;
    if (productId) {
      await tx.update(products).set(values).where(eq(products.id, productId));
      await tx.delete(productImages).where(eq(productImages.productId, productId));
      await tx.delete(productVideos).where(eq(productVideos.productId, productId));
    } else {
      const [row] = await tx.insert(products).values(values).returning({ id: products.id });
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

  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: { images: true, videos: true },
  });
  if (!product) return ok(undefined);

  await db.delete(products).where(eq(products.id, id));

  // Best-effort cleanup of uploaded files (local driver only knows /uploads/… URLs).
  const storage = getStorage();
  const keys = [...product.images.map((i) => i.url), ...product.videos.filter((v) => v.kind === "file").map((v) => v.url)]
    .map(keyFromLocalUrl)
    .filter((k): k is string => Boolean(k));
  await Promise.allSettled(keys.map((k) => storage.delete(k)));

  revalidatePath(PATH);
  updateTag(CACHE_TAGS.products);
  updateTag(CACHE_TAGS.product(id));
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
