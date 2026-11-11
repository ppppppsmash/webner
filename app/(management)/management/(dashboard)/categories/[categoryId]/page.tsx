import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/management/back-link";
import { t } from "@/lib/i18n/admin";
import { getCategory, listParentCategories } from "@/lib/queries/categories";
import { CategoryForm } from "../components/category-form";
import { PageSuspense } from "@/components/management/page-suspense";

export const metadata: Metadata = { title: t.categories.editTitle };

async function EditCategoryContent({ params }: PageProps<"/management/categories/[categoryId]">) {
  const { categoryId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(categoryId)) notFound();

  const [category, parents] = await Promise.all([getCategory(categoryId), listParentCategories()]);
  if (!category) notFound();

  return (
    <>
      <BackLink href="/management/categories" label={t.categories.title} />
      <CategoryForm initialData={category} parents={parents} />
    </>
  );
}

export default function EditCategoryPage(props: PageProps<"/management/categories/[categoryId]">) {
  return (
    <PageSuspense>
      <EditCategoryContent {...props} />
    </PageSuspense>
  );
}
