/**
 * One-off: move every uploaded file to the storage that is configured now (e.g. Cloudflare R2 behind a
 * custom domain) and repoint the database at the new URLs.
 *
 * The files are read from the URLs stored in the database (the old location stays public during the move)
 * and written to the storage described by the S3_* variables, under the same key.
 *
 *   pnpm media:migrate            dry run: lists what would move, writes nothing
 *   pnpm media:migrate --apply    copies the files and rewrites the URLs
 *
 * Before --apply (see CLAUDE.md):
 *   - .env.neon holds the NEW storage: S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID,
 *     S3_SECRET_ACCESS_KEY and S3_PUBLIC_URL (the public base URL, e.g. https://media.example.com);
 *   - the site is already deployed with those variables plus S3_LEGACY_PUBLIC_URL=<old base URL>,
 *     so both locations are allowed as image hosts while pages still show old URLs.
 *
 * Per file: copy, check the copy's size, then switch the media row and every reference in one transaction.
 * Nothing is deleted from the old storage. Running it again only handles files that have not moved yet.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import { getStorage, UPLOAD_ROOT } from "../lib/storage";

/** Columns that can hold the URL of an uploaded file (besides media.url itself). */
const REFERENCES: { table: string; column: string; json: boolean }[] = [
  { table: "product_images", column: "url", json: false },
  { table: "product_videos", column: "url", json: false },
  { table: "products", column: "description", json: true },
  { table: "site_settings", column: "value", json: true },
];

type MediaRow = { id: string; kind: string; key: string; url: string; file_name: string | null; content_type: string; size: number | string };

const apply = process.argv.includes("--apply");
const mb = (n: number) => `${(n / 1048576).toFixed(2)} MB`;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

async function readOriginal(row: MediaRow): Promise<Uint8Array> {
  if (/^https?:\/\//.test(row.url)) {
    const res = await fetch(row.url);
    if (!res.ok) throw new Error(`download failed (${res.status})`);
    return new Uint8Array(await res.arrayBuffer());
  }
  return readFile(path.join(UPLOAD_ROOT, row.key));
}

async function main() {
  if ((process.env.STORAGE_DRIVER || "local") !== "s3") throw new Error('The destination must be S3-compatible storage: run with STORAGE_DRIVER=s3 (pnpm media:migrate does).');
  if (!process.env.S3_PUBLIC_URL) throw new Error("S3_PUBLIC_URL is not set: it is the public base URL of the new storage (e.g. https://media.example.com).");
  const storage = getStorage();
  const destination = new URL(process.env.S3_PUBLIC_URL).origin;

  const rows = await sql<MediaRow[]>`select id, kind, key, url, file_name, content_type, size from media order by size desc`;
  const pending = rows.filter((r) => r.url !== storage.urlFor(r.key));
  console.log(`${apply ? "APPLY" : "DRY RUN (nothing is written; add --apply to move)"} — ${rows.length} files, ${pending.length} to move → ${destination}\n`);

  const moved: { key: string; oldUrl: string; newUrl: string; size: number }[] = [];
  let failed = 0;
  for (const row of pending) {
    const name = row.file_name ?? row.key;
    const newUrl = storage.urlFor(row.key);
    const refs: string[] = [];
    for (const ref of REFERENCES) {
      const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from ${sql(ref.table)} where strpos(${sql(ref.column)}::text, ${row.url}) > 0`;
      if (n) refs.push(`${ref.table}.${ref.column}×${n}`);
    }
    if (!apply) {
      console.log(`would ${row.kind}  ${name}  ${mb(Number(row.size))}  used in: ${refs.join(", ") || "nothing"}`);
      continue;
    }
    try {
      const data = await readOriginal(row);
      await storage.put(row.key, data, row.content_type);
      // Trust the copy only after the new storage reports the same size.
      const stat = await storage.stat?.(row.key);
      if (stat && stat.size !== data.byteLength) throw new Error(`size mismatch after upload (${stat.size} vs ${data.byteLength})`);
      await sql.begin(async (tx) => {
        for (const ref of REFERENCES) {
          const column = tx(ref.column);
          if (ref.json) {
            await tx`update ${tx(ref.table)} set ${column} = replace(${column}::text, ${row.url}, ${newUrl})::jsonb where strpos(${column}::text, ${row.url}) > 0`;
          } else {
            await tx`update ${tx(ref.table)} set ${column} = replace(${column}, ${row.url}, ${newUrl}) where strpos(${column}, ${row.url}) > 0`;
          }
        }
        await tx`update media set url = ${newUrl} where id = ${row.id}`;
      });
      moved.push({ key: row.key, oldUrl: row.url, newUrl, size: data.byteLength });
      console.log(`moved ${row.kind}  ${name}  ${mb(data.byteLength)}  used in: ${refs.join(", ") || "nothing"}`);
    } catch (err) {
      failed += 1;
      console.log(`FAILED ${name} — ${err instanceof Error ? err.message : err} (left on the old storage, database unchanged)`);
    }
  }

  if (!apply) return;
  console.log(`\nMoved ${moved.length}, failed ${failed}, already in place ${rows.length - pending.length}.`);
  if (moved.length) {
    const dir = path.resolve("scripts/output");
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, `migrate-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    await writeFile(file, JSON.stringify(moved, null, 2));
    console.log(`List of moved files: ${path.relative(process.cwd(), file)}`);
    console.log("Public pages are cached: redeploy (or save any product in the management panel) to show the new URLs now.");
    console.log("The old files were not deleted. Once the site shows the new URLs, remove S3_LEGACY_PUBLIC_URL and empty the old storage.");
  }
  if (failed) process.exitCode = 1;
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
