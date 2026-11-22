"use client";

import { UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileDropZone } from "@/components/management/file-drop-zone";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/admin";
import { uploadFile, UploadError } from "@/lib/upload-client";

type Progress = { done: number; total: number } | null;

/** Uploads images / videos straight into the library (no product needed), then refreshes the list. */
function useMediaUpload() {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress>(null);

  const upload = async (files: File[]) => {
    if (!files.length || progress !== null) return;
    setProgress({ done: 0, total: files.length });
    let uploaded = 0;
    for (const [i, file] of files.entries()) {
      try {
        await uploadFile(file, file.type.startsWith("video/") ? "video" : "image");
        uploaded += 1;
      } catch (err) {
        toast.error(`${file.name}: ${err instanceof UploadError ? err.message : t.upload.failed}`);
      }
      setProgress({ done: i + 1, total: files.length });
    }
    setProgress(null);
    if (uploaded) {
      toast.success(t.media.uploaded(uploaded));
      router.refresh();
    }
  };

  return { progress, upload };
}

function ProgressText({ progress }: { progress: Progress }) {
  if (!progress) return null;
  return (
    <span className="text-xs text-muted-foreground">
      {t.upload.uploading} {progress.done}/{progress.total}
    </span>
  );
}

export function MediaUploadButton() {
  const fileInput = useRef<HTMLInputElement>(null);
  const { progress, upload } = useMediaUpload();

  return (
    <div className="flex items-center gap-3">
      <ProgressText progress={progress} />
      <Button type="button" disabled={progress !== null} onClick={() => fileInput.current?.click()}>
        <UploadIcon data-icon="inline-start" />
        {t.media.upload}
      </Button>
      <input
        ref={fileInput}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          void upload(files);
        }}
      />
    </div>
  );
}

/** Wraps the library so files dropped anywhere on it are uploaded. */
export function MediaDropArea({ children }: { children: React.ReactNode }) {
  const { progress, upload } = useMediaUpload();

  return (
    <FileDropZone accept={["image", "video"]} disabled={progress !== null} onFiles={upload} hint={t.upload.dropMediaHint} className="min-h-64">
      {progress ? (
        <div className="mb-3">
          <ProgressText progress={progress} />
        </div>
      ) : null}
      {children}
    </FileDropZone>
  );
}
