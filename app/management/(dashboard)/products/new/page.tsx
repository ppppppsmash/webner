import type { Metadata } from "next";
import { BackLink } from "@/components/management/back-link";
import { t } from "@/lib/i18n/admin";
import { listCategoryOptions } from "@/lib/queries/categories";
import { ProductForm } from "../components/product-form";

export const metadata: Metadata = { title: t.products.createTitle };

export default async function NewProductPage() {
  const categories = await listCategoryOptions();
  return (
    <>
      <BackLink href="/management/products" label={t.products.title} />
      <ProductForm initialData={null} categories={categories} />
    </>
  );
}
