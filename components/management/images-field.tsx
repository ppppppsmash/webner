"use client";

import { ArrowLeftIcon, ArrowRightIcon, ImagePlusIcon, StarIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
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

/** Multi-image upload with ordering. The first image is the main image. */
export function ImagesField({ value, onChange, disabled }: ImagesFieldProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

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
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {value.map((img, index) => (
            <li
              key={img.url}
              className={cn(
                "group relative overflow-hidden rounded-lg border bg-muted/30",
                index === 0 && "ring-2 ring-primary/60",
              )}
            >
              <div className="relative aspect-square">
                <Image src={img.url} alt={img.alt ?? ""} fill unoptimized className="object-cover" sizes="200px" />
              </div>
              {index === 0 ? (
                <Badge className="absolute top-2 left-2 gap-1">
                  <StarIcon />
                  {t.products.mainImage}
                </Badge>
              ) : null}
              <div className="flex items-center justify-between gap-1 border-t bg-background p-1">
                <div className="flex items-center">
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={t.common.moveUp}
                    disabled={disabled || index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    <ArrowLeftIcon />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={t.common.moveDown}
                    disabled={disabled || index === value.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    <ArrowRightIcon />
                  </Button>
                  {index !== 0 ? (
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label={t.products.setMain}
                      title={t.products.setMain}
                      disabled={disabled}
                      onClick={() => move(index, 0)}
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
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                >
                  <TrashIcon />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" disabled={disabled || progress !== null} onClick={() => fileInput.current?.click()}>
          <ImagePlusIcon data-icon="inline-start" />
          {t.products.uploadImage}
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
