"use client";

import { FilmIcon, LinkIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteMedia } from "@/actions/media";
import { AlertModal } from "@/components/management/alert-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MediaKind } from "@/db/schema";
import { t } from "@/lib/i18n/admin";
import type { MediaUsage } from "@/lib/queries/media";

export type MediaItem = {
  id: string;
  kind: MediaKind;
  url: string;
  fileName: string;
  contentType: string;
  size: string;
  createdAt: string;
  products: MediaUsage[];
};

type Filter = "all" | MediaKind;
const PAGE_SIZE = 40;

export function MediaGrid({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [target, setTarget] = useState<MediaItem | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((m) => (filter === "all" || m.kind === filter) && (!q || m.fileName.toLowerCase().includes(q)));
  }, [items, filter, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);

  const onDelete = () => {
    if (!target) return;
    startTransition(async () => {
      const result = await deleteMedia(target.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.media.deleted);
      setTarget(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <AlertModal
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        onConfirm={onDelete}
        loading={pending}
        description={t.media.confirmDeleteDescription}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={t.media.searchPlaceholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          className="max-w-sm"
        />
        <Tabs
          value={filter}
          onValueChange={(v) => {
            setFilter(v as Filter);
            setPage(0);
          }}
        >
          <TabsList>
            <TabsTrigger value="all">{t.media.filterAll}</TabsTrigger>
            <TabsTrigger value="image">{t.media.kinds.image}</TabsTrigger>
            <TabsTrigger value="video">{t.media.kinds.video}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {visible.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {visible.map((m) => {
            const used = m.products.length > 0;
            return (
              <li key={m.id} className="flex flex-col overflow-hidden rounded-lg border bg-card" data-testid="media-card">
                <div className="relative aspect-square bg-muted/40">
                  {m.kind === "image" ? (
                    <Image src={m.url} alt={m.fileName} fill unoptimized sizes="240px" className="object-cover" />
                  ) : (
                    <>
                      <video src={m.url} muted preload="metadata" className="size-full object-cover" />
                      <FilmIcon className="absolute top-2 left-2 size-4 text-white drop-shadow" />
                    </>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                  <p className="truncate text-sm font-medium" title={m.fileName}>
                    {m.fileName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[m.contentType.split("/")[1]?.toUpperCase(), m.size, m.createdAt].filter(Boolean).join(" · ")}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
                    {used ? (
                      <Badge variant="secondary" title={m.products.map((p) => p.name).join("、")}>
                        {t.media.usedBy(m.products.length)}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        {t.media.unused}
                      </Badge>
                    )}
                  </div>
                  {used ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {m.products.map((p, i) => (
                        <span key={p.id}>
                          {i > 0 ? "、" : null}
                          <Link href={`/management/products/${p.id}`} className="hover:underline">
                            {p.name}
                          </Link>
                        </span>
                      ))}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center justify-between border-t px-1 py-0.5">
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={t.media.copyUrl}
                    title={t.media.copyUrl}
                    onClick={async () => {
                      await navigator.clipboard.writeText(new URL(m.url, window.location.origin).toString());
                      toast.success(t.common.copied);
                    }}
                  >
                    <LinkIcon />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    className="text-destructive"
                    aria-label={`${t.common.delete} ${m.fileName}`}
                    title={used ? t.media.inUse : t.common.delete}
                    disabled={used || pending}
                    onClick={() => setTarget(m)}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border text-sm text-muted-foreground">
          {items.length ? t.media.noMatch : t.media.empty}
        </div>
      )}

      {pageCount > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground">
            {current + 1} / {pageCount}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage(current - 1)} disabled={current === 0}>
            {t.common.previous}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage(current + 1)} disabled={current >= pageCount - 1}>
            {t.common.next}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
