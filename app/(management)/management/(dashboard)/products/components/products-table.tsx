"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon, ImageIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useMemo, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { reorderProducts } from "@/actions/products";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { t } from "@/lib/i18n/admin";
import { PRODUCT_VISIBILITIES, type ProductVisibility } from "@/lib/product-visibility";
import { cn } from "@/lib/utils";
import { ProductCellActions } from "./cell-actions";
import { VisibilitySelect } from "./visibility-select";

export type ProductColumn = {
  id: string;
  name: string;
  nameDe: string;
  slug: string;
  imageUrl: string | null;
  category: string;
  volume: string;
  visibility: ProductVisibility;
  scheduledAt: string | null;
  isFeatured: boolean;
  badge: string | null;
  tags: string[];
  updatedAt: string;
};

type Filter = "all" | ProductVisibility;

const COLUMN_COUNT = 8;

interface RowProps {
  row: ProductColumn;
  /** 1-based position in the full list (= order on the public site) */
  position: number;
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
  onMove: (id: string, to: "top" | "bottom") => void;
}

function SortableRow({ row, position, isFirst, isLast, disabled, onMove }: RowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
    disabled,
  });
  const title = row.name || row.nameDe || row.slug;

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(isDragging && "relative z-10 bg-muted shadow-md")}
    >
      <TableCell className="w-px px-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={t.products.dragHandle(title)}
            className={cn(
              "flex size-7 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
              isDragging && "cursor-grabbing",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <GripVerticalIcon className="size-4" />
          </button>
          <span data-testid="product-position" className="min-w-5 text-right text-xs text-muted-foreground tabular-nums">
            {position}
          </span>
        </div>
      </TableCell>
      <TableCell className="w-px px-3">
        <div className="relative size-10 overflow-hidden rounded-md border bg-muted">
          {row.imageUrl ? (
            <Image src={row.imageUrl} alt="" fill unoptimized sizes="40px" className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-4" />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="px-3">
        <div className="flex flex-col">
          <Link href={`/management/products/${row.id}`} className="font-medium hover:underline">
            {title}
          </Link>
          <span className="text-xs text-muted-foreground">
            {[row.nameDe !== row.name ? row.nameDe : null, row.volume].filter(Boolean).join(" · ")}
          </span>
          {row.tags.length ? (
            <span className="mt-1 flex flex-wrap gap-1">
              {row.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="h-5 px-1.5 text-[11px] font-normal text-muted-foreground">
                  {tag}
                </Badge>
              ))}
            </span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="px-3">
        {row.category ? (
          <span className="text-sm">{row.category}</span>
        ) : (
          <span className="text-xs text-muted-foreground">{t.products.noCategory}</span>
        )}
      </TableCell>
      <TableCell className="px-3">
        <div className="space-y-1">
          <VisibilitySelect id={row.id} visibility={row.visibility} />
          {row.scheduledAt ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">{t.products.scheduled(row.scheduledAt)}</p>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="px-3">
        <div className="flex flex-wrap gap-1">
          {row.isFeatured ? (
            <Badge variant="secondary" className="gap-1">
              <StarIcon />
              {t.products.featured}
            </Badge>
          ) : null}
          {row.badge ? <Badge variant="outline">{row.badge}</Badge> : null}
        </div>
      </TableCell>
      <TableCell className="px-3">
        <span className="text-xs text-muted-foreground">{row.updatedAt}</span>
      </TableCell>
      <TableCell className="px-3">
        <ProductCellActions
          data={row}
          onMoveTop={isFirst ? undefined : () => onMove(row.id, "top")}
          onMoveBottom={isLast ? undefined : () => onMove(row.id, "bottom")}
        />
      </TableCell>
    </TableRow>
  );
}

/**
 * Product list. Rows are in the order of the public site and can be dragged by the handle
 * (or moved with the keyboard: focus the handle, Space, arrows, Space). The order is saved on drop.
 */
export function ProductsTable({ data }: { data: ProductColumn[] }) {
  const dndId = useId();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  // Order shown right after a drop, until the server data comes back.
  const [orderedIds, setOrderedIds] = useOptimistic(data.map((d) => d.id));
  const ordered = useMemo(() => {
    const byId = new Map(data.map((d) => [d.id, d]));
    return orderedIds.map((id) => byId.get(id)).filter((d): d is ProductColumn => Boolean(d));
  }, [data, orderedIds]);
  const positions = useMemo(() => new Map(ordered.map((d, i) => [d.id, i + 1])), [ordered]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ordered.filter(
      (d) =>
        (filter === "all" || d.visibility === filter) &&
        (!q || [d.name, d.nameDe, d.slug, ...d.tags].some((s) => s.toLowerCase().includes(q))),
    );
  }, [ordered, filter, query]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const commit = (next: string[]) => {
    startTransition(async () => {
      setOrderedIds(next);
      const result = await reorderProducts(next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.products.reordered);
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const visibleIds = visible.map((d) => d.id);
    const from = visibleIds.indexOf(String(active.id));
    const to = visibleIds.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    // With a search / status filter on, only the visible rows swap places; hidden rows keep their slots.
    const moved = arrayMove(visibleIds, from, to);
    const shown = new Set(visibleIds);
    const next = [...orderedIds];
    let i = 0;
    for (let slot = 0; slot < next.length; slot++) {
      if (shown.has(next[slot])) next[slot] = moved[i++];
    }
    commit(next);
  };

  const onMove = (id: string, to: "top" | "bottom") => {
    const rest = orderedIds.filter((x) => x !== id);
    commit(to === "top" ? [id, ...rest] : [...rest, id]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={t.products.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">{t.products.filterAll}</TabsTrigger>
            {PRODUCT_VISIBILITIES.map((v) => (
              <TabsTrigger key={v} value={v}>
                {t.products.visibilityLabels[v]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <GripVerticalIcon className="size-3.5 shrink-0" />
        {t.products.orderHint}
      </p>

      <div className="overflow-hidden rounded-lg border">
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="px-3">{t.common.sortOrder}</TableHead>
                <TableHead className="px-3" />
                <TableHead className="px-3">{t.products.name}</TableHead>
                <TableHead className="px-3">{t.products.category}</TableHead>
                <TableHead className="px-3">{t.products.visibility}</TableHead>
                <TableHead className="px-3">{t.products.featured}</TableHead>
                <TableHead className="px-3">{t.common.updatedAt}</TableHead>
                <TableHead className="px-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length ? (
                <SortableContext items={visible.map((d) => d.id)} strategy={verticalListSortingStrategy}>
                  {visible.map((row) => {
                    const position = positions.get(row.id) ?? 0;
                    return (
                      <SortableRow
                        key={row.id}
                        row={row}
                        position={position}
                        isFirst={position === 1}
                        isLast={position === ordered.length}
                        disabled={pending}
                        onMove={onMove}
                      />
                    );
                  })}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell colSpan={COLUMN_COUNT} className="h-24 text-center text-muted-foreground">
                    {t.common.noResults}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}
