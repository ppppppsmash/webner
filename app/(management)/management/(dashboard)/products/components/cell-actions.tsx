"use client";

import { CopyIcon, ExternalLinkIcon, LinkIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteProduct } from "@/actions/products";
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
import { publicProductUrl } from "@/lib/public-url";
import type { ProductColumn } from "./products-table";

export function ProductCellActions({ data }: { data: ProductColumn }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onDelete = () => {
    startTransition(async () => {
      const result = await deleteProduct(data.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.products.deleted);
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
          <DropdownMenuItem onClick={() => router.push(`/management/products/${data.id}`)}>
            <PencilIcon />
            {t.common.edit}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await navigator.clipboard.writeText(publicProductUrl(data.slug));
              toast.success(t.common.copied);
            }}
          >
            <LinkIcon />
            {t.products.copyUrl}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open(publicProductUrl(data.slug), "_blank", "noopener")}>
            <ExternalLinkIcon />
            {t.products.openUrl}
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
