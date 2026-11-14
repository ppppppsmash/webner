"use client";

import { CheckIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { type LibraryImage, listLibraryImages } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n/admin";
import { cn } from "@/lib/utils";

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** URLs already on the product (shown but not selectable) */
  exclude: string[];
  onPick: (urls: string[]) => void;
}

/** "Pick from library" dialog: multi-select of already uploaded images. */
export function MediaPickerDialog({ open, onOpenChange, exclude, onPick }: MediaPickerDialogProps) {
  const [items, setItems] = useState<LibraryImage[] | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  // Selection and search are reset whenever the dialog opens or closes.
  const setOpen = (next: boolean) => {
    setSelected([]);
    setQuery("");
    onOpenChange(next);
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listLibraryImages()
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          toast.error(t.common.somethingWentWrong);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter((m) => !q || (m.fileName ?? "").toLowerCase().includes(q));
  }, [items, query]);

  const toggle = (url: string) => setSelected((prev) => (prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t.media.pickTitle}</DialogTitle>
          <DialogDescription>{t.media.pickDescription}</DialogDescription>
        </DialogHeader>

        <Input placeholder={t.media.searchPlaceholder} value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />

        <div className="max-h-[55vh] overflow-y-auto">
          {items === null ? (
            <p className="py-10 text-center text-sm text-muted-foreground">{t.common.loading}</p>
          ) : visible.length ? (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5" aria-label={t.media.pickTitle}>
              {visible.map((m) => {
                const added = exclude.includes(m.url);
                const on = selected.includes(m.url);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      disabled={added}
                      aria-pressed={on}
                      aria-label={m.fileName ?? m.url}
                      title={m.fileName ?? undefined}
                      onClick={() => toggle(m.url)}
                      className={cn(
                        "group relative block aspect-square w-full overflow-hidden rounded-md border bg-muted/40 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        on && "ring-2 ring-primary",
                        added && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <Image src={m.url} alt="" fill unoptimized sizes="160px" className="object-cover" />
                      {on ? (
                        <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <CheckIcon className="size-3.5" />
                        </span>
                      ) : null}
                      {added ? (
                        <span className="absolute inset-x-0 bottom-0 bg-background/80 py-0.5 text-center text-[11px]">{t.media.alreadyAdded}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">{items.length ? t.media.noMatch : t.media.empty}</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {t.common.cancel}
          </Button>
          <Button
            type="button"
            disabled={!selected.length}
            onClick={() => {
              onPick(selected);
              setOpen(false);
            }}
          >
            {t.media.pickAdd(selected.length)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
