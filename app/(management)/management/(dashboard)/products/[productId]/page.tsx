import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/management/back-link";
import { t } from "@/lib/i18n/admin";
import { listCategoryOptions } from "@/lib/queries/categories";
import { getProduct, listProductOptions } from "@/lib/queries/products";
import { ProductForm } from "../components/product-form";
import { PageSuspense } from "@/components/management/page-suspense";

export const metadata: Metadata = { title: t.products.editTitle };

async function EditProductContent({ params }: PageProps<"/management/products/[productId]">) {
  const { productId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(productId)) notFound();

  const [product, categories, productOptions] = await Promise.all([
    getProduct(productId),
    listCategoryOptions(),
    listProductOptions(productId),
  ]);
  if (!product) notFound();

  return (
    <>
      <BackLink href="/management/products" label={t.products.title} />
      <ProductForm initialData={product} categories={categories} productOptions={productOptions} />
    </>
  );
}

export default function EditProductPage(props: PageProps<"/management/products/[productId]">) {
  return (
    <PageSuspense>
      <EditProductContent {...props} />
    </PageSuspense>
  );
}
