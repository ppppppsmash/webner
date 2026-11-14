"use client";

import { SearchIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n/admin";
import { cn } from "@/lib/utils";

export interface RelatedProductOption {
  id: string;
  name: string;
  nameDe: string;
  imageUrl: string | null;
}

/** Pick up to `max` related products from a searchable list; empty = automatic (same category). */
export function RelatedProductsField({
  options,
  value,
  onChange,
  max = 4,
  disabled,
}: {
  options: RelatedProductOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  max?: number;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);
  const selected = value.map((id) => byId.get(id)).filter((o): o is RelatedProductOption => Boolean(o));
  const q = query.trim().toLowerCase();
  const candidates = options.filter(
    (o) => !value.includes(o.id) && (!q || o.name.toLowerCase().includes(q) || o.nameDe.toLowerCase().includes(q)),
  );
  const full = value.length >= max;

  return (
    <div className="space-y-3">
      {selected.length ? (
        <ul className="flex flex-wrap gap-2">
          {selected.map((o) => (
            <li key={o.id} className="flex items-center gap-2 rounded-md border bg-muted/40 py-1 pr-1 pl-1.5 text-sm">
              <Thumb src={o.imageUrl} />
              <span className="max-w-48 truncate">{o.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={t.common.remove}
                disabled={disabled}
                onClick={() => onChange(value.filter((id) => id !== o.id))}
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{t.products.relatedAuto}</p>
      )}

      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.products.relatedSearch}
          disabled={disabled || full}
          className="pl-8"
          aria-label={t.products.relatedSearch}
        />
      </div>

      <ul className={cn("max-h-56 divide-y overflow-y-auto rounded-md border", full && "opacity-60")}>
        {candidates.length ? (
          candidates.slice(0, 50).map((o) => (
            <li key={o.id}>
              <button
                type="button"
                disabled={disabled || full}
                onClick={() => onChange([...value, o.id])}
                className="flex w-full items-center gap-3 px-2 py-1.5 text-left text-sm hover:bg-muted disabled:cursor-not-allowed"
              >
                <Thumb src={o.imageUrl} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{o.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{o.nameDe}</span>
                </span>
              </button>
            </li>
          ))
        ) : (
          <li className="px-2 py-3 text-center text-xs text-muted-foreground">{t.common.noResults}</li>
        )}
      </ul>
      <p className="text-xs text-muted-foreground">
        {value.length} / {max}
      </p>
    </div>
  );
}

function Thumb({ src }: { src: string | null }) {
  return (
    <span className="relative size-8 shrink-0 overflow-hidden rounded border bg-muted">
      {src ? <Image src={src} alt="" fill sizes="32px" className="object-cover" /> : null}
    </span>
  );
}
