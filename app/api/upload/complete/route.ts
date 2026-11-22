import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getStorage, STORAGE_KEY_PATTERN, UPLOAD_LIMITS, type UploadKind } from "@/lib/storage";

/**
 * Step 2 of a direct upload. POST JSON { key, fileName }.
 * Checks the object the browser uploaded (it exists, allowed type, within the size limit) and registers it
 * in the media library. Returns the same shape as POST /api/upload.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { key?: unknown; fileName?: unknown } | null;
  const key = typeof body?.key === "string" ? body.key : "";
  const match = STORAGE_KEY_PATTERN.exec(key);
  if (!match) return Response.json({ error: "Invalid key" }, { status: 400 });
  const kind = match[1] as UploadKind;
  const limits = UPLOAD_LIMITS[kind];

  const storage = getStorage();
  if (!storage.stat) return Response.json({ error: "Direct upload is not available" }, { status: 400 });
  const info = await storage.stat(key);
  if (!info) return Response.json({ error: "File was not uploaded" }, { status: 404 });

  // The size and type sent to /sign are only a promise; what was actually stored decides.
  const contentType = info.contentType ?? "";
  if (limits.mimeTypes[contentType] !== match[2]) {
    await storage.delete(key);
    return Response.json({ error: "Unsupported file type", code: "invalid_type" }, { status: 415 });
  }
  if (info.size > limits.maxBytes) {
    await storage.delete(key);
    return Response.json({ error: "File too large", code: "too_large", maxBytes: limits.maxBytes }, { status: 413 });
  }

  const url = storage.urlFor(key);
  const fileName = typeof body?.fileName === "string" ? body.fileName.slice(0, 255) : null;
  const [row] = await db
    .insert(media)
    .values({ kind, key, url, fileName: fileName || null, contentType, size: info.size })
    .onConflictDoUpdate({ target: media.key, set: { size: info.size } })
    .returning({ id: media.id });
  return Response.json({ key, url, contentType, size: info.size, id: row.id }, { status: 201 });
}
