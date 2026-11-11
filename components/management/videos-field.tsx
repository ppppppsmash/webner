"use client";

import { ArrowDownIcon, ArrowUpIcon, FilmIcon, LinkIcon, TrashIcon, UploadIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n/admin";
import { uploadFile, UploadError } from "@/lib/upload-client";
import { parseVideoEmbed } from "@/lib/video-embed";

export type VideoValue = { kind: "file" | "embed"; url: string; title?: string };

interface VideosFieldProps {
  value: VideoValue[];
  onChange: (value: VideoValue[]) => void;
  disabled?: boolean;
}

/** Product videos: uploaded files and embedded URLs (YouTube etc.) in one ordered list. */
export function VideosField({ value, onChange, disabled }: VideosFieldProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedTitle, setEmbedTitle] = useState("");

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

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
        <ul className="space-y-2">
          {value.map((video, index) => {
            const embed = video.kind === "embed" ? parseVideoEmbed(video.url) : null;
            return (
              <li key={`${video.kind}-${video.url}`} className="flex gap-3 rounded-lg border p-2">
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
                    <Badge variant="outline">
                      {video.kind === "file" ? t.products.videoKindFile : t.products.videoKindEmbed}
                    </Badge>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-xs text-muted-foreground hover:underline"
                    >
                      {video.url}
                    </a>
                  </div>
                  <Input
                    value={video.title ?? ""}
                    placeholder={t.products.videoTitle}
                    disabled={disabled}
                    onChange={(e) => update(index, { title: e.target.value })}
                  />
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={t.common.moveUp}
                    disabled={disabled || index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    <ArrowUpIcon />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={t.common.moveDown}
                    disabled={disabled || index === value.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    <ArrowDownIcon />
                  </Button>
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
            );
          })}
        </ul>
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
