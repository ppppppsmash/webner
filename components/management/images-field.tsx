"use client";

import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImagePlusIcon, ImagesIcon, StarIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { MediaPickerDialog } from "@/components/management/media-picker-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/admin";
import { uploadFile, UploadError } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

export type ImageValue = { url: string; alt?: string };

interface ImagesFieldProps {
  value: ImageValue[];
  onChange: (value: ImageValue[]) => void;
  disabled?: boolean;
}

interface ImageTileProps {
  image: ImageValue;
  index: number;
  disabled?: boolean;
  onSetMain: () => void;
  onRemove: () => void;
}

/** One thumbnail; the picture itself is the drag handle. */
function ImageTile({ image, index, disabled, onSetMain, onRemove }: ImageTileProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: image.url,
    disabled,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-muted/30",
        index === 0 && "ring-2 ring-primary/60",
        isDragging && "z-10 shadow-lg",
      )}
    >
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={t.products.dragImage(index + 1)}
        className={cn(
          "relative aspect-square touch-none outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
          disabled ? "cursor-not-allowed" : isDragging ? "cursor-grabbing" : "cursor-grab",
        )}
      >
        <Image src={image.url} alt={image.alt ?? ""} fill unoptimized draggable={false} className="object-cover" sizes="200px" />
      </div>
      {index === 0 ? (
        <Badge className="pointer-events-none absolute top-2 left-2 gap-1">
          <StarIcon />
          {t.products.mainImage}
        </Badge>
      ) : null}
      <div className="flex items-center justify-between gap-1 border-t bg-background p-1">
        <div className="flex items-center">
          <span className="px-1.5 text-xs text-muted-foreground tabular-nums">{index + 1}</span>
          {index !== 0 ? (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              aria-label={t.products.setMain}
              title={t.products.setMain}
              disabled={disabled}
              onClick={onSetMain}
            >
              <StarIcon />
            </Button>
          ) : null}
        </div>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          className="text-destructive"
          aria-label={t.common.remove}
          disabled={disabled}
          onClick={onRemove}
        >
          <TrashIcon />
        </Button>
      </div>
    </li>
  );
}

/** Multi-image upload; drag the thumbnails to reorder. The first image is the main image. */
export function ImagesField({ value, onChange, disabled }: ImagesFieldProps) {
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = value.findIndex((v) => v.url === active.id);
    const to = value.findIndex((v) => v.url === over.id);
    if (from >= 0 && to >= 0) onChange(arrayMove(value, from, to));
  };
  const fileInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const onPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    setProgress({ done: 0, total: files.length });
    const added: ImageValue[] = [];
    for (const [i, file] of files.entries()) {
      try {
        const stored = await uploadFile(file, "image");
        added.push({ url: stored.url, alt: "" });
      } catch (err) {
        toast.error(`${file.name}: ${err instanceof UploadError ? err.message : t.upload.failed}`);
      }
      setProgress({ done: i + 1, total: files.length });
    }
    if (added.length) onChange([...value, ...added]);
    setProgress(null);
  };

  return (
    <div className="space-y-3">
      {value.length ? (
        <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={value.map((v) => v.url)} strategy={rectSortingStrategy}>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {value.map((img, index) => (
                <ImageTile
                  key={img.url}
                  image={img}
                  index={index}
                  disabled={disabled}
                  onSetMain={() => move(index, 0)}
                  onRemove={() => onChange(value.filter((_, i) => i !== index))}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : null}

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        exclude={value.map((v) => v.url)}
        onPick={(urls) => onChange([...value, ...urls.filter((u) => !value.some((v) => v.url === u)).map((url) => ({ url, alt: "" }))])}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" disabled={disabled || progress !== null} onClick={() => fileInput.current?.click()}>
          <ImagePlusIcon data-icon="inline-start" />
          {t.products.uploadImage}
        </Button>
        <Button type="button" variant="outline" disabled={disabled || progress !== null} onClick={() => setPickerOpen(true)}>
          <ImagesIcon data-icon="inline-start" />
          {t.media.pickFromLibrary}
        </Button>
        {progress ? (
          <span className="text-xs text-muted-foreground">
            {t.upload.uploading} {progress.done}/{progress.total}
          </span>
        ) : null}
        <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={onPick} />
      </div>
    </div>
  );
}
