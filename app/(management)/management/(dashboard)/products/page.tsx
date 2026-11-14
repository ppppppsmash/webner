import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { PageSuspense } from "@/components/management/page-suspense";
import { PageHeader } from "@/components/management/page-header";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { t } from "@/lib/i18n/admin";
import { pickText } from "@/lib/i18n/locales";
import { listProducts } from "@/lib/queries/products";
import { ProductsTable, type ProductColumn } from "./components/products-table";

export const metadata: Metadata = { title: t.products.title };

async function ProductsContent() {
  const rows = await listProducts();
  const data: ProductColumn[] = rows.map((p) => ({
    id: p.id,
    name: pickText(p.name, "zh-TW"),
    nameDe: pickText(p.name, "de"),
    slug: p.slug,
    imageUrl: p.images[0]?.url ?? null,
    category: p.category
      ? [p.category.parent ? pickText(p.category.parent.name, "zh-TW") : null, pickText(p.category.name, "zh-TW")]
          .filter(Boolean)
          .join(" › ")
      : "",
    volume: p.volume ?? "",
    visibility: p.visibility,
    isFeatured: p.isFeatured,
    badge: p.badge ? t.products.badges[p.badge] : null,
    sortOrder: p.sortOrder,
    updatedAt: formatDateTime(p.updatedAt),
  }));

  return (
    <>
      <PageHeader
        title={t.products.count(data.length)}
        description={t.products.listDescription}
        action={
          <Button nativeButton={false} render={<Link href="/management/products/new" />}>
            <PlusIcon data-icon="inline-start" />
            {t.products.addNew}
          </Button>
        }
      />
      <ProductsTable data={data} />
    </>
  );
}

export default function ProductsPage() {
  return (
    <PageSuspense>
      <ProductsContent />
    </PageSuspense>
  );
}
