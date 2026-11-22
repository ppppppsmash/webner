export type UploadKind = "image" | "video";

export interface StoredFile {
  /** Storage key (path inside the bucket / upload dir) */
  key: string;
  /** Public URL the browser can load */
  url: string;
  contentType: string;
  size: number;
  /** Media library row id (set by /api/upload) */
  id?: string;
}

export interface StorageDriver {
  put(key: string, data: Uint8Array, contentType: string): Promise<StoredFile>;
  delete(key: string): Promise<void>;
  /** Public URL for a key */
  urlFor(key: string): string;
  /**
   * Short-lived URL the browser can PUT the file to directly (skips the app server, so no request-size limit).
   * Drivers without it (local) are uploaded through /api/upload instead.
   */
  presignPut?(key: string, contentType: string): Promise<{ url: string; headers: Record<string, string> }>;
  /** Size and type of a stored object, or null when it does not exist (used to confirm a direct upload). */
  stat?(key: string): Promise<{ size: number; contentType: string | null } | null>;
}

/** Key layout produced by `buildKey`: images/2026/11/<uuid>.png */
export const STORAGE_KEY_PATTERN = /^(image|video)s\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.([a-z0-9]+)$/;

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
