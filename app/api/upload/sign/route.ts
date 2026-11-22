import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { buildKey, getStorage, UPLOAD_LIMITS, type UploadKind } from "@/lib/storage";

/**
 * Step 1 of a direct upload. POST JSON { kind, contentType, size }.
 * Returns { direct: true, key, uploadUrl, headers } when the storage can take the file straight from the browser,
 * or { direct: false } when the file has to go through POST /api/upload (local storage).
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { kind?: unknown; contentType?: unknown; size?: unknown } | null;
  const kind = body?.kind;
  if ((kind !== "image" && kind !== "video") || typeof body?.contentType !== "string" || typeof body?.size !== "number") {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const limits = UPLOAD_LIMITS[kind as UploadKind];
  const ext = limits.mimeTypes[body.contentType];
  if (!ext) return Response.json({ error: "Unsupported file type", code: "invalid_type" }, { status: 415 });
  if (body.size > limits.maxBytes) {
    return Response.json({ error: "File too large", code: "too_large", maxBytes: limits.maxBytes }, { status: 413 });
  }

  const storage = getStorage();
  if (!storage.presignPut) return Response.json({ direct: false });

  const key = buildKey(kind as UploadKind, ext);
  const { url, headers } = await storage.presignPut(key, body.contentType);
  return Response.json({ direct: true, key, uploadUrl: url, headers });
}
