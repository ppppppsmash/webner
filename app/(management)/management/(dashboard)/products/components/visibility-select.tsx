"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { setProductVisibility } from "@/actions/products";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { t } from "@/lib/i18n/admin";
import { PRODUCT_VISIBILITIES, type ProductVisibility } from "@/lib/product-visibility";
import { cn } from "@/lib/utils";

export const VISIBILITY_ITEMS = PRODUCT_VISIBILITIES.map((v) => ({ value: v, label: t.products.visibilityLabels[v] }));

const DOT: Record<ProductVisibility, string> = {
  draft: "bg-muted-foreground/40",
  hidden: "bg-amber-500",
  published: "bg-emerald-500",
};

/** Coloured dot + label, shared by the list and the form. */
export function VisibilityDot({ visibility }: { visibility: ProductVisibility }) {
  return <span aria-hidden className={cn("size-2 shrink-0 rounded-full", DOT[visibility])} />;
}

/** Inline status select for the product list (optimistic). */
export function VisibilitySelect({ id, visibility }: { id: string; visibility: ProductVisibility }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(visibility);

  const onChange = (next: ProductVisibility) => {
    startTransition(async () => {
      setOptimistic(next);
      const result = await setProductVisibility(id, next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <Select
      items={VISIBILITY_ITEMS}
      value={optimistic}
      onValueChange={(v) => v && onChange(v as ProductVisibility)}
      disabled={pending}
    >
      <SelectTrigger size="sm" className="min-w-24 text-xs" aria-label={t.products.visibility}>
        <VisibilityDot visibility={optimistic} />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {VISIBILITY_ITEMS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            <VisibilityDot visibility={item.value} />
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
