export type UploadKind = "image" | "video";

export interface StoredFile {
  /** Storage key (path inside the bucket / upload dir) */
  key: string;
  /** Public URL the browser can load */
  url: string;
  contentType: string;
  size: number;
}

export interface StorageDriver {
  put(key: string, data: Uint8Array, contentType: string): Promise<StoredFile>;
  delete(key: string): Promise<void>;
  /** Public URL for a key */
  urlFor(key: string): string;
}

export const UPLOAD_LIMITS: Record<UploadKind, { maxBytes: number; mimeTypes: Record<string, string> }> = {
  image: {
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/avif": "avif",
    },
  },
  video: {
    maxBytes: 500 * 1024 * 1024,
    mimeTypes: {
      "video/mp4": "mp4",
      "video/webm": "webm",
      "video/quicktime": "mov",
    },
  },
};
