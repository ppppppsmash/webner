"use client";

import { CopyIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteCategory } from "@/actions/categories";
import { AlertModal } from "@/components/management/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { t } from "@/lib/i18n/admin";
import type { CategoryColumn } from "./categories-table";

export function CategoryCellActions({ data }: { data: CategoryColumn }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onDelete = () => {
    startTransition(async () => {
      const result = await deleteCategory(data.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.categories.deleted);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <AlertModal open={open} onOpenChange={setOpen} onConfirm={onDelete} loading={pending} />
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={t.common.actions} />}>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(data.id);
              toast.success(t.common.copied);
            }}
          >
            <CopyIcon />
            {t.common.copyId}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/management/categories/${data.id}`)}>
            <PencilIcon />
            {t.common.edit}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setOpen(true)}>
            <TrashIcon />
            {t.common.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
