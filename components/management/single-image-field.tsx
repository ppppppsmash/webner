"use client";

import { ImagePlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n/admin";
import { uploadFile, UploadError } from "@/lib/upload-client";

/** One optional image (e.g. the home hero), uploaded through /api/upload. */
export function SingleImageField({
  value,
  onChange,
  disabled,
  uploadLabel = t.settings.uploadHeroImage,
  aspect = "aspect-[2/1]",
}: {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  uploadLabel?: string;
  aspect?: string;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const onPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setProgress(0);
    try {
      const stored = await uploadFile(file, "image", setProgress);
      onChange(stored.url);
    } catch (err) {
      toast.error(err instanceof UploadError ? err.message : t.upload.failed);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className={`relative w-full max-w-xl overflow-hidden rounded-lg border bg-muted ${aspect}`}>
          <Image src={value} alt="" fill unoptimized className="object-cover" sizes="600px" />
        </div>
      ) : null}
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" disabled={disabled || progress !== null} onClick={() => fileInput.current?.click()}>
          <ImagePlusIcon data-icon="inline-start" />
          {progress !== null ? `${t.upload.uploading} ${Math.round(progress * 100)}%` : uploadLabel}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" className="text-destructive" disabled={disabled} onClick={() => onChange("")}>
            <TrashIcon data-icon="inline-start" />
            {t.settings.removeImage}
          </Button>
        ) : null}
        <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onPick} />
      </div>
    </div>
  );
}
