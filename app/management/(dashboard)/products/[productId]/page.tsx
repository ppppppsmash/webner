import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/management/back-link";
import { t } from "@/lib/i18n/admin";
import { listCategoryOptions } from "@/lib/queries/categories";
import { getProduct } from "@/lib/queries/products";
import { ProductForm } from "../components/product-form";

export const metadata: Metadata = { title: t.products.editTitle };

export default async function EditProductPage({ params }: PageProps<"/management/products/[productId]">) {
  const { productId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(productId)) notFound();

  const [product, categories] = await Promise.all([getProduct(productId), listCategoryOptions()]);
  if (!product) notFound();

  return (
    <>
      <BackLink href="/management/products" label={t.products.title} />
      <ProductForm initialData={product} categories={categories} />
    </>
  );
}
