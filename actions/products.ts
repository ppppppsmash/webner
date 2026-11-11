"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { productImages, products, productVideos } from "@/db/schema";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth/guard";
import { t } from "@/lib/i18n/admin";
import { slugFromName } from "@/lib/slug";
import { getStorage, keyFromLocalUrl } from "@/lib/storage";
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
    description: compactRichText(data.description),
    slug,
    categoryId: data.categoryId,
    volume: data.volume || null,
    externalUrl: data.externalUrl || null,
    isPublished: data.isPublished,
    isFeatured: data.isFeatured,
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
  return ok(undefined);
}

export async function setProductPublished(id: string, isPublished: boolean): Promise<ActionResult> {
  await requireAdmin();
  await db.update(products).set({ isPublished }).where(eq(products.id, id));
  revalidatePath(PATH);
  return ok(undefined);
}
