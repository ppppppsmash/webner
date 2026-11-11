"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { setProductPublished } from "@/actions/products";
import { Switch } from "@/components/ui/switch";
import { t } from "@/lib/i18n/admin";

export function PublishSwitch({ id, isPublished }: { id: string; isPublished: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(isPublished);

  const onChange = (checked: boolean) => {
    startTransition(async () => {
      setOptimistic(checked);
      const result = await setProductPublished(id, checked);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <label className="flex items-center gap-2 text-xs">
      <Switch size="sm" checked={optimistic} disabled={pending} onCheckedChange={onChange} />
      <span className={optimistic ? "text-foreground" : "text-muted-foreground"}>
        {optimistic ? t.products.statusPublished : t.products.statusDraft}
      </span>
    </label>
  );
}
