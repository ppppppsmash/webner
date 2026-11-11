"use client";

import { t } from "@/lib/i18n/admin";
import type { StoredFile, UploadKind } from "@/lib/storage/types";

export class UploadError extends Error {}

/**
 * Uploads one file to /api/upload with progress (XHR, so large videos report progress).
 */
export function uploadFile(
  file: File,
  kind: UploadKind,
  onProgress?: (ratio: number) => void,
): Promise<StoredFile> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("kind", kind);
    form.append("file", file);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.onerror = () => reject(new UploadError(t.upload.failed));
    xhr.onload = () => {
      let body: Record<string, unknown> = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // ignore
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as unknown as StoredFile);
        return;
      }
      if (body.code === "too_large") {
        reject(new UploadError(t.upload.tooLarge(Math.round(Number(body.maxBytes) / 1024 / 1024))));
      } else if (body.code === "invalid_type") {
        reject(new UploadError(t.upload.invalidType));
      } else {
        reject(new UploadError(t.upload.failed));
      }
    };
    xhr.open("POST", "/api/upload");
    xhr.send(form);
  });
}
