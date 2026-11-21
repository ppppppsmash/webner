"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { t } from "@/lib/i18n/admin";
import { cn } from "@/lib/utils";
import { PRODUCT_LIMITS } from "@/lib/validation/product";

export type CategoryOption = { id: string; label: string; depth: number };

interface CategoriesFieldProps {
  /** Tree order: each parent followed by its children */
  options: CategoryOption[];
  /** Selected category ids in the order they were ticked (first = main category) */
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

/** Checkbox tree for a product's categories. Several can be ticked; the first ticked one is the main category. */
export function CategoriesField({ options, value, onChange, disabled }: CategoriesFieldProps) {
  if (!options.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {t.products.categoryEmpty}
        {" · "}
        <Link href="/management/categories" className="underline underline-offset-4">
          {t.products.categoryManage}
        </Link>
      </p>
    );
  }

  const full = value.length >= PRODUCT_LIMITS.categories;
  const toggle = (id: string, checked: boolean) => {
    if (checked) {
      if (!value.includes(id) && !full) onChange([...value, id]);
    } else {
      onChange(value.filter((v) => v !== id));
    }
  };

  return (
    <ul className="max-h-80 overflow-y-auto rounded-md border py-1">
      {options.map((o) => {
        const checked = value.includes(o.id);
        return (
          <li key={o.id}>
            <label
              className={cn(
                "flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-muted/60",
                o.depth > 0 && "pl-9",
                o.depth === 0 && "font-medium",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(c) => toggle(o.id, c === true)}
                disabled={disabled || (!checked && full)}
              />
              <span className="min-w-0 truncate">{o.label}</span>
              {checked && value[0] === o.id && value.length > 1 ? (
                <Badge variant="secondary" className="ml-auto shrink-0">
                  {t.products.categoryMain}
                </Badge>
              ) : null}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
