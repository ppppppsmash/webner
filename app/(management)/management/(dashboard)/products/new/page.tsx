import type { Metadata } from "next";
import { BackLink } from "@/components/management/back-link";
import { t } from "@/lib/i18n/admin";
import { listCategoryOptions } from "@/lib/queries/categories";
import { listProductOptions } from "@/lib/queries/products";
import { ProductForm } from "../components/product-form";
import { PageSuspense } from "@/components/management/page-suspense";

export const metadata: Metadata = { title: t.products.createTitle };

async function NewProductContent() {
  const [categories, productOptions] = await Promise.all([listCategoryOptions(), listProductOptions()]);
  return (
    <>
      <BackLink href="/management/products" label={t.products.title} />
      <ProductForm initialData={null} categories={categories} productOptions={productOptions} />
    </>
  );
}

export default function NewProductPage() {
  return (
    <PageSuspense>
      <NewProductContent />
    </PageSuspense>
  );
}
