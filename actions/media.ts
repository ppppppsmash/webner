"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { media } from "@/db/schema";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth/guard";
import { t } from "@/lib/i18n/admin";
import { getMediaUsage } from "@/lib/queries/media";
import { getStorage } from "@/lib/storage";

const PATH = "/management/media";

/** Deletes a library file (storage + row). Refused while any product still references it. */
export async function deleteMedia(id: string): Promise<ActionResult> {
  await requireAdmin();
  const row = await db.query.media.findFirst({ where: eq(media.id, id) });
  if (!row) return ok(undefined);

  const usage = await getMediaUsage(row.url);
  if (usage.length) return fail(t.media.inUse);

  await getStorage().delete(row.key);
  await db.delete(media).where(eq(media.id, id));
  revalidatePath(PATH);
  return ok(undefined);
}

export type LibraryImage = { id: string; url: string; fileName: string | null; createdAt: string };

/** Images for the "pick from library" dialog in the product form (newest first). */
export async function listLibraryImages(): Promise<LibraryImage[]> {
  await requireAdmin();
  const rows = await db.query.media.findMany({
    where: eq(media.kind, "image"),
    orderBy: [desc(media.createdAt)],
    columns: { id: true, url: true, fileName: true, createdAt: true },
    limit: 500,
  });
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}
