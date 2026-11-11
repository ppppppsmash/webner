import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/management/page-header";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/admin";
import { pickText } from "@/lib/i18n/locales";
import { listCategories } from "@/lib/queries/categories";
import { CategoriesTable, type CategoryColumn } from "./components/categories-table";

export const metadata: Metadata = { title: t.categories.title };

export default async function CategoriesPage() {
  const rows = await listCategories();
  const data: CategoryColumn[] = rows.map((r) => ({
    id: r.id,
    name: pickText(r.name, "zh-TW"),
    nameDe: pickText(r.name, "de"),
    slug: r.slug,
    parentId: r.parentId,
    parentName: r.parent ? pickText(r.parent.name, "zh-TW") : null,
    productCount: r.productCount,
    sortOrder: r.sortOrder,
  }));

  return (
    <>
      <PageHeader
        title={t.categories.count(data.length)}
        description={t.categories.listDescription}
        action={
          <Button nativeButton={false} render={<Link href="/management/categories/new" />}>
            <PlusIcon data-icon="inline-start" />
            {t.categories.addNew}
          </Button>
        }
      />
      <CategoriesTable data={data} />
    </>
  );
}
