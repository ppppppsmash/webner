import type { Metadata } from "next";
import { BackLink } from "@/components/management/back-link";
import { t } from "@/lib/i18n/admin";
import { listParentCategories } from "@/lib/queries/categories";
import { CategoryForm } from "../components/category-form";
import { PageSuspense } from "@/components/management/page-suspense";

export const metadata: Metadata = { title: t.categories.createTitle };

async function NewCategoryContent() {
  const parents = await listParentCategories();
  return (
    <>
      <BackLink href="/management/categories" label={t.categories.title} />
      <CategoryForm initialData={null} parents={parents} />
    </>
  );
}

export default function NewCategoryPage() {
  return (
    <PageSuspense>
      <NewCategoryContent />
    </PageSuspense>
  );
}
