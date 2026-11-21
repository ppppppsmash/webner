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
import { CornerDownRightIcon, GripVerticalIcon } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { reorderCategories } from "@/actions/categories";
import { DragHandle } from "@/components/management/drag-handle";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { t } from "@/lib/i18n/admin";
import { cn } from "@/lib/utils";
import { CategoryCellActions } from "./cell-actions";

export type CategoryColumn = {
  id: string;
  name: string;
  nameDe: string;
  slug: string;
  parentId: string | null;
  parentName: string | null;
  productCount: number;
};

type TreeRow = CategoryColumn & { /** "2" for a parent, "2.1" for its first child */ position: string };

/** Flat tree order: each top-level category followed by its children, in the order of `ids`. */
function toTree(data: CategoryColumn[], ids: string[]): TreeRow[] {
  const byId = new Map(data.map((d) => [d.id, d]));
  const rows = ids.map((id) => byId.get(id)).filter((d): d is CategoryColumn => Boolean(d));
  const isTop = (r: CategoryColumn) => !r.parentId || !byId.has(r.parentId);
  const out: TreeRow[] = [];
  rows.filter(isTop).forEach((parent, i) => {
    out.push({ ...parent, position: String(i + 1) });
    rows
      .filter((r) => r.parentId === parent.id)
      .forEach((child, j) => out.push({ ...child, position: `${i + 1}.${j + 1}` }));
  });
  return out;
}

function SortableRow({ row, disabled }: { row: TreeRow; disabled: boolean }) {
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
        <div className={cn("flex items-center gap-1.5", row.parentId && "pl-6")}>
          <DragHandle
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            label={t.categories.dragHandle(title)}
            dragging={isDragging}
            disabled={disabled}
          />
          <span data-testid="category-position" className="min-w-6 text-xs text-muted-foreground tabular-nums">
            {row.position}
          </span>
        </div>
      </TableCell>
      <TableCell className="px-3">
        <div className="flex items-center gap-2">
          {row.parentId ? <CornerDownRightIcon className="size-3.5 text-muted-foreground" /> : null}
          <Link href={`/management/categories/${row.id}`} className={cn("hover:underline", !row.parentId && "font-medium")}>
            {title}
          </Link>
          {row.name && row.nameDe && row.name !== row.nameDe ? (
            <span className="text-xs text-muted-foreground">{row.nameDe}</span>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="px-3">
        <code className="text-xs text-muted-foreground">{row.slug}</code>
      </TableCell>
      <TableCell className="px-3">
        <Badge variant="secondary">{row.productCount}</Badge>
      </TableCell>
      <TableCell className="px-3">
        <CategoryCellActions data={row} />
      </TableCell>
    </TableRow>
  );
}

/**
 * Category tree. Rows can be dragged within their own level (top-level categories among themselves,
 * sub-categories inside their parent). The order is saved on drop and used by the public site menus.
 */
export function CategoriesTable({ data }: { data: CategoryColumn[] }) {
  const dndId = useId();
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [orderedIds, setOrderedIds] = useOptimistic(data.map((d) => d.id));

  const tree = useMemo(() => toTree(data, orderedIds), [data, orderedIds]);
  const q = query.trim().toLowerCase();
  const visible = q ? tree.filter((r) => [r.name, r.nameDe, r.slug].some((s) => s.toLowerCase().includes(q))) : tree;
  // Dragging needs the whole tree on screen, so it is off while searching.
  const dragDisabled = pending || Boolean(q);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const moving = tree.find((r) => r.id === active.id);
    let target = tree.find((r) => r.id === over.id);
    if (!moving || !target) return;
    // A top-level category dropped onto a sub-category lands next to that sub-category's parent.
    if (!moving.parentId && target.parentId) target = tree.find((r) => r.id === target?.parentId);
    if (!target || target.id === moving.id) return;
    if ((moving.parentId ?? null) !== (target.parentId ?? null)) {
      toast.error(t.categories.sameLevelOnly);
      return;
    }
    const siblings = tree.filter((r) => (r.parentId ?? null) === (moving.parentId ?? null)).map((r) => r.id);
    const moved = arrayMove(siblings, siblings.indexOf(moving.id), siblings.indexOf(target.id));
    const group = new Set(siblings);
    let i = 0;
    const next = tree.map((r) => (group.has(r.id) ? moved[i++] : r.id));

    startTransition(async () => {
      setOrderedIds(next);
      const result = await reorderCategories(next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.categories.reordered);
    });
  };

  return (
    <div className="space-y-4">
      <Input placeholder={t.common.search} value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-sm" />

      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <GripVerticalIcon className="size-3.5 shrink-0" />
        {t.categories.orderHint}
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
                <TableHead className="px-3">{t.categories.name}</TableHead>
                <TableHead className="px-3">{t.common.slug}</TableHead>
                <TableHead className="px-3">{t.categories.productsCount}</TableHead>
                <TableHead className="px-3" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length ? (
                <SortableContext items={visible.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                  {visible.map((row) => (
                    <SortableRow key={row.id} row={row} disabled={dragDisabled} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
