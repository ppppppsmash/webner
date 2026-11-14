"use client";

import { UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/admin";
import { uploadFile, UploadError } from "@/lib/upload-client";

/** Uploads images / videos straight into the library (no product needed). */
export function MediaUploadButton() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const onPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
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

  return (
    <div className="flex items-center gap-3">
      {progress ? (
        <span className="text-xs text-muted-foreground">
          {t.upload.uploading} {progress.done}/{progress.total}
        </span>
      ) : null}
      <Button type="button" disabled={progress !== null} onClick={() => fileInput.current?.click()}>
        <UploadIcon data-icon="inline-start" />
        {t.media.upload}
      </Button>
      <input ref={fileInput} type="file" accept="image/*,video/*" multiple className="hidden" onChange={onPick} />
    </div>
  );
}
