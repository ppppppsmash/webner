"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ImageIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/management/data-table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/lib/i18n/admin";
import { ProductCellActions } from "./cell-actions";
import { PRODUCT_VISIBILITIES, type ProductVisibility } from "@/lib/product-visibility";
import { VisibilitySelect } from "./visibility-select";

export type ProductColumn = {
  id: string;
  name: string;
  nameDe: string;
  slug: string;
  imageUrl: string | null;
  category: string;
  volume: string;
  visibility: ProductVisibility;
  scheduledAt: string | null;
  isFeatured: boolean;
  badge: string | null;
  tags: string[];
  sortOrder: number;
  updatedAt: string;
};

const columns: ColumnDef<ProductColumn>[] = [
  {
    id: "image",
    header: "",
    cell: ({ row }) => (
      <div className="relative size-10 overflow-hidden rounded-md border bg-muted">
        {row.original.imageUrl ? (
          <Image src={row.original.imageUrl} alt="" fill unoptimized sizes="40px" className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-4" />
          </div>
        )}
      </div>
    ),
  },
  {
    id: "name",
    // Search box matches names in both languages and the management tags.
    accessorFn: (row) => [row.name, row.nameDe, ...row.tags].join(" "),
    header: t.products.name,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <Link href={`/management/products/${row.original.id}`} className="font-medium hover:underline">
          {row.original.name || row.original.nameDe || row.original.slug}
        </Link>
        <span className="text-xs text-muted-foreground">
          {[row.original.nameDe !== row.original.name ? row.original.nameDe : null, row.original.volume]
            .filter(Boolean)
            .join(" · ")}
        </span>
        {row.original.tags.length ? (
          <span className="mt-1 flex flex-wrap gap-1">
            {row.original.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="h-5 px-1.5 text-[11px] font-normal text-muted-foreground">
                {tag}
              </Badge>
            ))}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: t.products.category,
    cell: ({ row }) =>
      row.original.category ? (
        <span className="text-sm">{row.original.category}</span>
      ) : (
        <span className="text-xs text-muted-foreground">{t.products.noCategory}</span>
      ),
  },
  {
    accessorKey: "visibility",
    header: t.products.visibility,
    cell: ({ row }) => (
      <div className="space-y-1">
        <VisibilitySelect id={row.original.id} visibility={row.original.visibility} />
        {row.original.scheduledAt ? (
          <p className="text-xs text-amber-600 dark:text-amber-400">{t.products.scheduled(row.original.scheduledAt)}</p>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "isFeatured",
    header: t.products.featured,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.isFeatured ? (
          <Badge variant="secondary" className="gap-1">
            <StarIcon />
            {t.products.featured}
          </Badge>
        ) : null}
        {row.original.badge ? <Badge variant="outline">{row.original.badge}</Badge> : null}
      </div>
    ),
  },
  {
    accessorKey: "sortOrder",
    header: t.common.sortOrder,
  },
  {
    accessorKey: "updatedAt",
    header: t.common.updatedAt,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.updatedAt}</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductCellActions data={row.original} />,
  },
];

type Filter = "all" | ProductVisibility;

export function ProductsTable({ data }: { data: ProductColumn[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = useMemo(() => (filter === "all" ? data : data.filter((d) => d.visibility === filter)), [data, filter]);

  return (
    <DataTable
      columns={columns}
      data={filtered}
      searchKey="name"
      searchPlaceholder={t.products.searchPlaceholder}
      toolbar={
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">{t.products.filterAll}</TabsTrigger>
            {PRODUCT_VISIBILITIES.map((v) => (
              <TabsTrigger key={v} value={v}>
                {t.products.visibilityLabels[v]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    />
  );
}
