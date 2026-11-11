import path from "node:path";
import { LocalStorageDriver } from "./local";
import type { StorageDriver, UploadKind } from "./types";

export * from "./types";

// The upload directory is configured by env (development only; production uses R2),
// so the path cannot be statically scoped for the bundler.
export const UPLOAD_ROOT = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOAD_DIR || "./uploads");

let driver: StorageDriver | undefined;

/**
 * Storage is swapped by env, so production (Cloudflare R2 / S3) only needs a
 * new driver here; the rest of the app talks to this interface.
 */
export function getStorage(): StorageDriver {
  if (driver) return driver;
  const name = process.env.STORAGE_DRIVER || "local";
  switch (name) {
    case "local":
      driver = new LocalStorageDriver(UPLOAD_ROOT);
      return driver;
    case "s3":
      throw new Error("STORAGE_DRIVER=s3 is not implemented yet (planned for production: Cloudflare R2)");
    default:
      throw new Error(`Unknown STORAGE_DRIVER: ${name}`);
  }
}

export function buildKey(kind: UploadKind, ext: string): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${kind}s/${yyyy}/${mm}/${crypto.randomUUID()}.${ext}`;
}

/** Extracts the storage key from a public URL produced by the local driver (or null). */
export function keyFromLocalUrl(url: string): string | null {
  if (!url.startsWith("/uploads/")) return null;
  return url
    .slice("/uploads/".length)
    .split("/")
    .map(decodeURIComponent)
    .join("/");
}
