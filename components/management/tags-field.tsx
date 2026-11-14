"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n/admin";
import { PRODUCT_LIMITS } from "@/lib/validation/product";

export type TagOption = { tag: string; count: number };

interface TagsFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  /** Existing tags (for suggestions), most used first */
  options?: TagOption[];
  disabled?: boolean;
}

/** Chip input for management-only tags. Enter / comma adds; suggestions come from tags already in use. */
export function TagsField({ value, onChange, options = [], disabled }: TagsFieldProps) {
  const [draft, setDraft] = useState("");
  const full = value.length >= PRODUCT_LIMITS.tags;

  const add = (raw: string) => {
    const tag = raw.trim().slice(0, PRODUCT_LIMITS.tag);
    if (!tag || value.includes(tag) || full) return;
    onChange([...value, tag]);
  };

  const commitDraft = () => {
    for (const part of draft.split(/[,，]/)) add(part);
    setDraft("");
  };

  const suggestions = useMemo(() => {
    const q = draft.trim().toLowerCase();
    return options
      .filter((o) => !value.includes(o.tag) && (!q || o.tag.toLowerCase().includes(q)))
      .slice(0, 12);
  }, [options, value, draft]);

  return (
    <div className="space-y-2">
      {value.length ? (
        <ul className="flex flex-wrap gap-1.5" aria-label={t.products.tags}>
          {value.map((tag) => (
            <li key={tag}>
              <Badge variant="secondary" className="gap-1 pr-1">
                {tag}
                <button
                  type="button"
                  className="rounded-sm hover:bg-foreground/10 disabled:opacity-50"
                  aria-label={`${t.common.remove} ${tag}`}
                  disabled={disabled}
                  onClick={() => onChange(value.filter((v) => v !== tag))}
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-2">
        <Input
          value={draft}
          disabled={disabled || full}
          placeholder={full ? t.products.tagsMax(PRODUCT_LIMITS.tags) : t.products.tagsPlaceholder}
          maxLength={PRODUCT_LIMITS.tag}
          aria-label={t.products.tags}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commitDraft();
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => {
            if (draft.trim()) commitDraft();
          }}
        />
        <Button type="button" variant="outline" disabled={disabled || full || !draft.trim()} onClick={commitDraft}>
          <PlusIcon data-icon="inline-start" />
          {t.products.tagsAdd}
        </Button>
      </div>

      {suggestions.length ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{t.products.tagsSuggest}</span>
          {suggestions.map((o) => (
            <button
              key={o.tag}
              type="button"
              disabled={disabled || full}
              className="rounded-md border px-2 py-0.5 text-xs hover:bg-muted disabled:opacity-50"
              onClick={() => {
                add(o.tag);
                setDraft("");
              }}
            >
              {o.tag}
              <span className="ml-1 text-muted-foreground">{o.count}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
