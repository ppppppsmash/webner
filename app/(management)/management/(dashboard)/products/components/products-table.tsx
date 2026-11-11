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
import { PublishSwitch } from "./publish-switch";

export type ProductColumn = {
  id: string;
  name: string;
  nameDe: string;
  slug: string;
  imageUrl: string | null;
  category: string;
  volume: string;
  isPublished: boolean;
  isFeatured: boolean;
  status: "published" | "draft";
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
    accessorKey: "name",
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
    accessorKey: "status",
    header: t.products.status,
    cell: ({ row }) => <PublishSwitch id={row.original.id} isPublished={row.original.isPublished} />,
  },
  {
    accessorKey: "isFeatured",
    header: t.products.featured,
    cell: ({ row }) =>
      row.original.isFeatured ? (
        <Badge variant="secondary" className="gap-1">
          <StarIcon />
          {t.products.featured}
        </Badge>
      ) : null,
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

type Filter = "all" | "published" | "draft";

export function ProductsTable({ data }: { data: ProductColumn[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = useMemo(() => (filter === "all" ? data : data.filter((d) => d.status === filter)), [data, filter]);

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
            <TabsTrigger value="published">{t.products.filterPublished}</TabsTrigger>
            <TabsTrigger value="draft">{t.products.filterDraft}</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    />
  );
}
