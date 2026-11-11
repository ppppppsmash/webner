"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CornerDownRightIcon } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/management/data-table";
import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/i18n/admin";
import { CategoryCellActions } from "./cell-actions";

export type CategoryColumn = {
  id: string;
  name: string;
  nameDe: string;
  slug: string;
  parentId: string | null;
  parentName: string | null;
  productCount: number;
  sortOrder: number;
};

const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "name",
    header: t.categories.name,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.parentId ? <CornerDownRightIcon className="size-3.5 text-muted-foreground" /> : null}
        <Link href={`/management/categories/${row.original.id}`} className="font-medium hover:underline">
          {row.original.name || row.original.nameDe}
        </Link>
        {row.original.name && row.original.nameDe && row.original.name !== row.original.nameDe ? (
          <span className="text-xs text-muted-foreground">{row.original.nameDe}</span>
        ) : null}
      </div>
    ),
  },
  {
    accessorKey: "slug",
    header: t.common.slug,
    cell: ({ row }) => <code className="text-xs text-muted-foreground">{row.original.slug}</code>,
  },
  {
    accessorKey: "productCount",
    header: t.categories.productsCount,
    cell: ({ row }) => <Badge variant="secondary">{row.original.productCount}</Badge>,
  },
  {
    accessorKey: "sortOrder",
    header: t.common.sortOrder,
  },
  {
    id: "actions",
    cell: ({ row }) => <CategoryCellActions data={row.original} />,
  },
];

export function CategoriesTable({ data }: { data: CategoryColumn[] }) {
  return <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder={t.common.search} pageSize={50} />;
}
