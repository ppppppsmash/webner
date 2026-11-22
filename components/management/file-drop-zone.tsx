"use client";

import { UploadCloudIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { t } from "@/lib/i18n/admin";
import type { UploadKind } from "@/lib/storage/types";
import { cn } from "@/lib/utils";

interface FileDropZoneProps {
  /** Which kinds of files may be dropped here */
  accept: UploadKind[];
  /** false = only the first dropped file is used */
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  /** Small text under the content, e.g. "或將圖片拖曳到這裡" (omit to show nothing) */
  hint?: string;
  /** Draw the dashed frame (off when the wrapped content already has its own frame) */
  framed?: boolean;
  className?: string;
  children: React.ReactNode;
}

const isFileDrag = (e: React.DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

/**
 * Wraps an upload control so files can also be dropped on it from the desktop.
 * Only reacts to file drags, so it does not interfere with the sortable lists inside it.
 */
export function FileDropZone({ accept, multiple = true, disabled, onFiles, hint, framed = true, className, children }: FileDropZoneProps) {
  const [over, setOver] = useState(false);
  // dragenter / dragleave also fire for child elements; count them to know when the pointer really left.
  const depth = useRef(0);

  const reset = () => {
    depth.current = 0;
    setOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    reset();
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    const accepted = dropped.filter((f) => accept.some((kind) => f.type.startsWith(`${kind}/`)));
    for (const f of dropped) if (!accepted.includes(f)) toast.error(`${f.name}: ${t.upload.invalidType}`);
    if (accepted.length) onFiles(multiple ? accepted : accepted.slice(0, 1));
  };

  return (
    <div
      data-slot="file-drop-zone"
      data-over={over || undefined}
      onDragEnter={(e) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        depth.current += 1;
        if (!disabled) setOver(true);
      }}
      onDragOver={(e) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = disabled ? "none" : "copy";
      }}
      onDragLeave={(e) => {
        if (!isFileDrag(e)) return;
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setOver(false);
      }}
      onDrop={onDrop}
      className={cn(
        "relative rounded-lg transition-colors",
        framed && "border border-dashed p-3",
        over && "border-primary bg-primary/5 ring-2 ring-primary/30",
        className,
      )}
    >
      {children}
      {hint ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <UploadCloudIcon className="size-3.5 shrink-0" />
          {hint}
        </p>
      ) : null}
      {over ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-background/70 text-sm font-medium text-primary">
          <UploadCloudIcon className="mr-2 size-5" />
          {t.upload.dropToUpload}
        </div>
      ) : null}
    </div>
  );
}
