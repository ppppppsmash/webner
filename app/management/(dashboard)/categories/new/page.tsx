import type { Metadata } from "next";
import { BackLink } from "@/components/management/back-link";
import { t } from "@/lib/i18n/admin";
import { listParentCategories } from "@/lib/queries/categories";
import { CategoryForm } from "../components/category-form";

export const metadata: Metadata = { title: t.categories.createTitle };

export default async function NewCategoryPage() {
  const parents = await listParentCategories();
  return (
    <>
      <BackLink href="/management/categories" label={t.categories.title} />
      <CategoryForm initialData={null} parents={parents} />
    </>
  );
}
