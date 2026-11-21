"use client";

import { GripVerticalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragHandleProps extends React.ComponentProps<"button"> {
  /** Accessible name, e.g. "拖曳調整排序：商品名" */
  label: string;
  dragging?: boolean;
}

/**
 * Grip button used as the drag activator of a sortable row (dnd-kit).
 * Spread `attributes` and `listeners` from `useSortable` onto it and pass `setActivatorNodeRef` as `ref`.
 * Keyboard: focus, Space to pick up, arrows to move, Space to drop.
 */
export function DragHandle({ label, dragging, disabled, className, ...props }: DragHandleProps) {
  return (
    <button
      type="button"
      {...props}
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={cn(
        "flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        dragging && "cursor-grabbing",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <GripVerticalIcon className="size-4" />
    </button>
  );
}
