/**
 * One-off: shrink the images that were uploaded before uploads were compressed in the browser.
 * Applies the same rules as lib/image-compress.ts (longest side 2560 px, WebP quality 82).
 *
 *   pnpm media:recompress                 dry run on the local database: shows what would change, writes nothing
 *   pnpm media:recompress --apply         converts and repoints the database
 *   pnpm media:recompress --delete-originals=scripts/output/recompress-….json
 *                                         removes the old files listed in a manifest from an earlier --apply
 *   pnpm media:recompress:neon …          the same against the hosted database and storage (.env.neon)
 *
 * How --apply works, per image:
 *   1. the smaller file is written under a NEW key (files are cached as immutable, so a key is never reused);
 *   2. in one transaction the media row and every reference to the old URL are switched to the new one
 *      (product images, images inside product descriptions, site settings);
 *   3. the old file is left in place and recorded in a manifest.
 * Old files stay because public pages are cached for up to a few hours and may still point at them.
 * Delete them with --delete-originals once the site shows the new ones (after a redeploy, or the next day).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import sharp, { type OutputInfo } from "sharp";
import { buildKey, getStorage, UPLOAD_ROOT } from "../lib/storage";

const MAX_EDGE = 2560;
const QUALITY = 82;
const SKIP_BELOW_BYTES = 200 * 1024;
const COMPRESSIBLE = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Columns that can hold the URL of an uploaded image (besides media.url itself). */
const REFERENCES: { table: string; column: string; json: boolean }[] = [
  { table: "product_images", column: "url", json: false },
  { table: "products", column: "description", json: true },
  { table: "site_settings", column: "value", json: true },
];

type MediaRow = { id: string; key: string; url: string; file_name: string | null; content_type: string; size: number | string };
type ManifestEntry = { mediaId: string; fileName: string | null; oldKey: string; oldUrl: string; oldSize: number; newKey: string; newUrl: string; newSize: number };

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const manifestArg = args.find((a) => a.startsWith("--delete-originals="))?.split("=")[1];
const mb = (n: number) => `${(n / 1048576).toFixed(2)} MB`;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
const storage = getStorage();

async function readOriginal(row: MediaRow): Promise<Buffer> {
  if (/^https?:\/\//.test(row.url)) {
    const res = await fetch(row.url);
    if (!res.ok) throw new Error(`download failed (${res.status})`);
    return Buffer.from(await res.arrayBuffer());
  }
  return readFile(path.join(UPLOAD_ROOT, row.key));
}

/** How many rows of each referencing column contain the URL. */
async function countReferences(url: string) {
  const found: string[] = [];
  for (const ref of REFERENCES) {
    const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from ${sql(ref.table)} where strpos(${sql(ref.column)}::text, ${url}) > 0`;
    if (n) found.push(`${ref.table}.${ref.column}×${n}`);
  }
  return found;
}

async function deleteOriginals(file: string) {
  const entries = JSON.parse(await readFile(file, "utf8")) as ManifestEntry[];
  let removed = 0;
  for (const e of entries) {
    // Never delete a file something still points at.
    const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from media where url = ${e.oldUrl} or key = ${e.oldKey}`;
    const refs = await countReferences(e.oldUrl);
    if (n || refs.length) {
      console.log(`KEEP  ${e.oldKey} — still referenced (${[n ? "media" : "", ...refs].filter(Boolean).join(", ")})`);
      continue;
    }
    await storage.delete(e.oldKey);
    removed += 1;
    console.log(`DEL   ${e.oldKey} (${mb(e.oldSize)})`);
  }
  console.log(`\nRemoved ${removed} of ${entries.length} original files.`);
}

async function main() {
  if (manifestArg) return deleteOriginals(manifestArg);

  const rows = await sql<MediaRow[]>`select id, key, url, file_name, content_type, size from media where kind = 'image' order by size desc`;
  const remote = rows.some((r) => /^https?:\/\//.test(r.url));
  const driver = process.env.STORAGE_DRIVER || "local";
  if (remote && driver !== "s3") {
    throw new Error("These files live on S3-compatible storage but STORAGE_DRIVER is not \"s3\": the new files would be written to the local disk. Run with STORAGE_DRIVER=s3 (pnpm media:recompress:neon does).");
  }

  console.log(`${apply ? "APPLY" : "DRY RUN (nothing is written; add --apply to convert)"} — ${rows.length} images, storage driver: ${driver}\n`);
  const manifest: ManifestEntry[] = [];
  let before = 0;
  let after = 0;

  for (const row of rows) {
    const size = Number(row.size);
    const name = row.file_name ?? row.key.split("/").pop() ?? row.key;
    before += size;
    const skip = (why: string) => {
      after += size;
      console.log(`skip  ${name}  ${mb(size)}  — ${why}`);
    };
    if (!COMPRESSIBLE.has(row.content_type)) {
      skip(`${row.content_type} is left as is`);
      continue;
    }

    let out: { data: Buffer; info: OutputInfo };
    let dims: string;
    try {
      const input = await readOriginal(row);
      const meta = await sharp(input).metadata();
      const needsResize = Math.max(meta.width ?? 0, meta.height ?? 0) > MAX_EDGE;
      // WebP that fits is already the target format: encoding it again would only lose quality (and makes a re-run a no-op).
      if (!needsResize && (size < SKIP_BELOW_BYTES || row.content_type === "image/webp")) {
        skip(row.content_type === "image/webp" ? "already WebP" : "already small");
        continue;
      }
      // rotate(): bake in the EXIF orientation, as the browser does on upload.
      out = await sharp(input).rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer({ resolveWithObject: true });
      dims = `${meta.width}×${meta.height} → ${out.info.width}×${out.info.height}`;
    } catch (err) {
      skip(`could not be read: ${err instanceof Error ? err.message : err}`);
      continue;
    }
    if (out.data.byteLength > size * 0.9) {
      skip("would not get clearly smaller");
      continue;
    }

    const refs = await countReferences(row.url);
    const saved = Math.round((1 - out.data.byteLength / size) * 100);
    console.log(`${apply ? "done " : "would"} ${name}  ${row.content_type} ${mb(size)} → image/webp ${mb(out.data.byteLength)} (−${saved}%)  ${dims}  used in: ${refs.join(", ") || "nothing"}`);
    after += out.data.byteLength;
    if (!apply) continue;

    const newKey = buildKey("image", "webp");
    const stored = await storage.put(newKey, out.data, "image/webp");
    const newName = row.file_name ? `${row.file_name.replace(/\.[^.]+$/, "")}.webp` : null;
    try {
      await sql.begin(async (tx) => {
        for (const ref of REFERENCES) {
          const column = tx(ref.column);
          if (ref.json) {
            await tx`update ${tx(ref.table)} set ${column} = replace(${column}::text, ${row.url}, ${stored.url})::jsonb where strpos(${column}::text, ${row.url}) > 0`;
          } else {
            await tx`update ${tx(ref.table)} set ${column} = replace(${column}, ${row.url}, ${stored.url}) where strpos(${column}, ${row.url}) > 0`;
          }
        }
        await tx`update media set key = ${newKey}, url = ${stored.url}, content_type = 'image/webp', size = ${out.data.byteLength}, file_name = ${newName} where id = ${row.id}`;
      });
    } catch (err) {
      // The database still points at the original: remove the copy that is now unused.
      await storage.delete(newKey).catch(() => {});
      throw err;
    }
    manifest.push({ mediaId: row.id, fileName: row.file_name, oldKey: row.key, oldUrl: row.url, oldSize: size, newKey, newUrl: stored.url, newSize: out.data.byteLength });
  }

  console.log(`\nTotal: ${mb(before)} → ${mb(after)}${before ? ` (−${Math.round((1 - after / before) * 100)}%)` : ""}`);
  if (apply && manifest.length) {
    const dir = path.resolve("scripts/output");
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, `recompress-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    await writeFile(file, JSON.stringify(manifest, null, 2));
    console.log(`\nConverted ${manifest.length} images. The originals were kept; manifest: ${path.relative(process.cwd(), file)}`);
    console.log("Public pages are cached: redeploy (or save any product in the management panel) to show the new files now.");
    console.log(`When the site shows them, remove the originals with:  --delete-originals=${path.relative(process.cwd(), file)}`);
  }
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
