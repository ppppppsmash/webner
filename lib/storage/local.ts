import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageDriver, StoredFile } from "./types";

/**
 * Development driver: writes files under UPLOAD_DIR and serves them
 * through the `/uploads/[...path]` route handler.
 */
export class LocalStorageDriver implements StorageDriver {
  constructor(private readonly rootDir: string) {}

  private resolve(key: string) {
    const target = path.resolve(this.rootDir, key);
    if (!target.startsWith(path.resolve(this.rootDir) + path.sep)) {
      throw new Error("Invalid storage key");
    }
    return target;
  }

  async put(key: string, data: Uint8Array, contentType: string): Promise<StoredFile> {
    const target = this.resolve(key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, data);
    return { key, url: this.urlFor(key), contentType, size: data.byteLength };
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolve(key), { force: true });
  }

  urlFor(key: string): string {
    return `/uploads/${key.split("/").map(encodeURIComponent).join("/")}`;
  }
}
