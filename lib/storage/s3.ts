import { AwsClient } from "aws4fetch";
import type { StorageDriver, StoredFile } from "./types";

export interface S3Config {
  /** S3 API endpoint without the bucket, e.g. https://<account>.r2.cloudflarestorage.com or the Neon branch storage endpoint */
  endpoint: string;
  /** Signing region ("auto" for Cloudflare R2, e.g. "us-east-1" for Neon) */
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Base URL the browser reads files from (public bucket URL or a custom domain). Defaults to `<endpoint>/<bucket>`. */
  publicUrl?: string;
}

/** Keys are unique per upload (random UUID), so files never change once written. */
const CACHE_CONTROL = "public, max-age=31536000, immutable";
/** How long a direct-upload URL stays valid (large videos on slow connections need time to start). */
const PRESIGN_SECONDS = 15 * 60;

const encodeKey = (key: string) => key.split("/").map(encodeURIComponent).join("/");
const trimSlash = (url: string) => url.replace(/\/+$/, "");

/**
 * S3-compatible driver (Cloudflare R2, Neon Object Storage, MinIO, AWS S3).
 * Uses path-style requests signed with SigV4 over fetch, so it also runs on Cloudflare Workers.
 * Files are read by the browser straight from `publicUrl`, so the bucket must allow public reads.
 */
export class S3StorageDriver implements StorageDriver {
  private readonly client: AwsClient;
  private readonly bucketUrl: string;
  private readonly publicUrl: string;

  constructor(config: S3Config) {
    this.client = new AwsClient({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
      service: "s3",
    });
    this.bucketUrl = `${trimSlash(config.endpoint)}/${config.bucket}`;
    this.publicUrl = trimSlash(config.publicUrl || this.bucketUrl);
  }

  async put(key: string, data: Uint8Array, contentType: string): Promise<StoredFile> {
    const res = await this.client.fetch(`${this.bucketUrl}/${encodeKey(key)}`, {
      method: "PUT",
      body: data as BodyInit,
      headers: {
        "content-type": contentType,
        "cache-control": CACHE_CONTROL,
      },
    });
    if (!res.ok) throw new Error(`Storage upload failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
    return { key, url: this.urlFor(key), contentType, size: data.byteLength };
  }

  async delete(key: string): Promise<void> {
    const res = await this.client.fetch(`${this.bucketUrl}/${encodeKey(key)}`, { method: "DELETE" });
    // Deleting a missing object is not an error (S3 answers 204, some servers 404).
    if (!res.ok && res.status !== 404) {
      throw new Error(`Storage delete failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
    }
  }

  urlFor(key: string): string {
    return `${this.publicUrl}/${encodeKey(key)}`;
  }

  async presignPut(key: string, contentType: string) {
    const url = new URL(`${this.bucketUrl}/${encodeKey(key)}`);
    url.searchParams.set("X-Amz-Expires", String(PRESIGN_SECONDS));
    const signed = await this.client.sign(url.toString(), { method: "PUT", aws: { signQuery: true } });
    return { url: signed.url, headers: { "content-type": contentType, "cache-control": CACHE_CONTROL } };
  }

  async stat(key: string) {
    const res = await this.client.fetch(`${this.bucketUrl}/${encodeKey(key)}`, { method: "HEAD" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Storage lookup failed (${res.status})`);
    return { size: Number(res.headers.get("content-length") ?? 0), contentType: res.headers.get("content-type") };
  }
}

/**
 * Reads the S3_* settings; throws with the list of missing variables.
 * The standard AWS_* names (what Neon's console and `neon env pull` hand out) are accepted as a fallback.
 */
export function s3ConfigFromEnv(env: Record<string, string | undefined> = process.env): S3Config {
  const required = {
    S3_ENDPOINT: env.S3_ENDPOINT || env.AWS_ENDPOINT_URL_S3,
    S3_BUCKET: env.S3_BUCKET,
    S3_ACCESS_KEY_ID: env.S3_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: env.S3_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY,
  };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length) throw new Error(`STORAGE_DRIVER=s3 needs ${missing.join(", ")}`);
  return {
    endpoint: required.S3_ENDPOINT as string,
    bucket: required.S3_BUCKET as string,
    accessKeyId: required.S3_ACCESS_KEY_ID as string,
    secretAccessKey: required.S3_SECRET_ACCESS_KEY as string,
    region: env.S3_REGION || env.AWS_REGION || "auto",
    publicUrl: env.S3_PUBLIC_URL || undefined,
  };
}
