"use client";

import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FilmIcon, LinkIcon, TrashIcon, UploadIcon } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { DragHandle } from "@/components/management/drag-handle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n/admin";
import { uploadFile, UploadError } from "@/lib/upload-client";
import { cn } from "@/lib/utils";
import { parseVideoEmbed } from "@/lib/video-embed";

export type VideoValue = { kind: "file" | "embed"; url: string; title?: string };

interface VideosFieldProps {
  value: VideoValue[];
  onChange: (value: VideoValue[]) => void;
  disabled?: boolean;
}

const videoKey = (v: VideoValue) => `${v.kind}-${v.url}`;

interface VideoRowProps {
  video: VideoValue;
  index: number;
  disabled?: boolean;
  onTitle: (title: string) => void;
  onRemove: () => void;
}

function VideoRow({ video, index, disabled, onTitle, onRemove }: VideoRowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: videoKey(video),
    disabled,
  });
  const embed = video.kind === "embed" ? parseVideoEmbed(video.url) : null;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("flex items-center gap-2 rounded-lg border bg-background p-2", isDragging && "relative z-10 shadow-md")}
    >
      <DragHandle
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        label={t.products.dragVideo(index + 1)}
        dragging={isDragging}
        disabled={disabled}
      />
      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-muted">
        {video.kind === "file" ? (
          <video src={video.url} preload="metadata" muted className="size-full object-cover" />
        ) : embed?.thumbnailUrl ? (
          <Image src={embed.thumbnailUrl} alt="" fill unoptimized className="object-cover" sizes="128px" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <FilmIcon />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{video.kind === "file" ? t.products.videoKindFile : t.products.videoKindEmbed}</Badge>
          <a href={video.url} target="_blank" rel="noreferrer" className="truncate text-xs text-muted-foreground hover:underline">
            {video.url}
          </a>
        </div>
        <Input value={video.title ?? ""} placeholder={t.products.videoTitle} disabled={disabled} onChange={(e) => onTitle(e.target.value)} />
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
    </li>
  );
}

/** Product videos: uploaded files and embedded URLs (YouTube etc.) in one list; drag the handle to reorder. */
export function VideosField({ value, onChange, disabled }: VideosFieldProps) {
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = value.findIndex((v) => videoKey(v) === active.id);
    const to = value.findIndex((v) => videoKey(v) === over.id);
    if (from >= 0 && to >= 0) onChange(arrayMove(value, from, to));
  };
  const fileInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedTitle, setEmbedTitle] = useState("");

  const update = (index: number, patch: Partial<VideoValue>) =>
    onChange(value.map((v, i) => (i === index ? { ...v, ...patch } : v)));

  const onPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setProgress(0);
    try {
      const stored = await uploadFile(file, "video", (ratio) => setProgress(ratio));
      onChange([...value, { kind: "file", url: stored.url, title: file.name.replace(/\.[^.]+$/, "") }]);
    } catch (err) {
      toast.error(err instanceof UploadError ? err.message : t.upload.failed);
    } finally {
      setProgress(null);
    }
  };

  const addEmbed = () => {
    const parsed = parseVideoEmbed(embedUrl);
    if (!parsed) {
      toast.error(t.upload.invalidType);
      return;
    }
    onChange([...value, { kind: "embed", url: embedUrl.trim(), title: embedTitle.trim() }]);
    setEmbedUrl("");
    setEmbedTitle("");
  };

  return (
    <div className="space-y-4">
      {value.length ? (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={value.map(videoKey)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {value.map((video, index) => (
                <VideoRow
                  key={videoKey(video)}
                  video={video}
                  index={index}
                  disabled={disabled}
                  onTitle={(title) => update(index, { title })}
                  onRemove={() => onChange(value.filter((_, i) => i !== index))}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : null}

      <div className="flex flex-col gap-3 rounded-lg border border-dashed p-3 md:flex-row md:items-center">
        <Button type="button" variant="outline" disabled={disabled || progress !== null} onClick={() => fileInput.current?.click()}>
          <UploadIcon data-icon="inline-start" />
          {progress !== null ? `${t.upload.uploading} ${Math.round(progress * 100)}%` : t.products.uploadVideo}
        </Button>
        <input ref={fileInput} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={onPick} />
        <span className="text-xs text-muted-foreground md:px-2">{t.login.or}</span>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <Input
            value={embedUrl}
            placeholder={t.products.embedUrlPlaceholder}
            disabled={disabled}
            onChange={(e) => setEmbedUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addEmbed();
              }
            }}
          />
          <Input
            value={embedTitle}
            placeholder={t.products.videoTitle}
            disabled={disabled}
            className="sm:max-w-48"
            onChange={(e) => setEmbedTitle(e.target.value)}
          />
          <Button type="button" variant="secondary" disabled={disabled || !embedUrl.trim()} onClick={addEmbed}>
            <LinkIcon data-icon="inline-start" />
            {t.products.addEmbed}
          </Button>
        </div>
      </div>
    </div>
  );
}
