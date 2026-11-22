"use client";

import { t } from "@/lib/i18n/admin";
import type { StoredFile, UploadKind } from "@/lib/storage/types";

export class UploadError extends Error {}

type ErrorBody = { code?: string; maxBytes?: number };

function toError(body: ErrorBody): UploadError {
  if (body.code === "too_large") return new UploadError(t.upload.tooLarge(Math.round(Number(body.maxBytes) / 1024 / 1024)));
  if (body.code === "invalid_type") return new UploadError(t.upload.invalidType);
  return new UploadError(t.upload.failed);
}

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  } catch {
    throw new UploadError(t.upload.failed);
  }
  const body = (await res.json().catch(() => ({}))) as T & ErrorBody;
  if (!res.ok) throw toError(body);
  return body;
}

/** XHR (not fetch) so large files report upload progress. Resolves with the response text. */
function send(
  method: "POST" | "PUT",
  url: string,
  body: XMLHttpRequestBodyInit,
  headers: Record<string, string>,
  onProgress?: (ratio: number) => void,
): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.onerror = () => reject(new UploadError(t.upload.failed));
    xhr.onload = () => resolve({ status: xhr.status, text: xhr.responseText });
    xhr.open(method, url);
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);
    xhr.send(body);
  });
}

type SignResult = { direct: false } | { direct: true; key: string; uploadUrl: string; headers: Record<string, string> };

/**
 * Uploads one file and registers it in the media library.
 * With S3-compatible storage the browser sends the file straight to the storage (signed URL), so the app
 * server's request-size limit does not apply; with local storage it goes through POST /api/upload.
 */
export async function uploadFile(file: File, kind: UploadKind, onProgress?: (ratio: number) => void): Promise<StoredFile> {
  const signed = await postJson<SignResult>("/api/upload/sign", { kind, contentType: file.type, size: file.size });

  if (signed.direct) {
    const put = await send("PUT", signed.uploadUrl, file, signed.headers, onProgress);
    if (put.status < 200 || put.status >= 300) throw new UploadError(t.upload.failed);
    return postJson<StoredFile>("/api/upload/complete", { key: signed.key, fileName: file.name });
  }

  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file);
  const res = await send("POST", "/api/upload", form, {}, onProgress);
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(res.text);
  } catch {
    // ignore
  }
  if (res.status >= 200 && res.status < 300) return body as unknown as StoredFile;
  throw toError(body as ErrorBody);
}
