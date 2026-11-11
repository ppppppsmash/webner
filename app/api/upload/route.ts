import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { buildKey, getStorage, UPLOAD_LIMITS, type UploadKind } from "@/lib/storage";

/**
 * POST multipart/form-data { file, kind: "image" | "video" }
 * Returns { url, key, contentType, size }.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const kind = form.get("kind");
  const file = form.get("file");
  if ((kind !== "image" && kind !== "video") || !(file instanceof File)) {
    return Response.json({ error: "Missing file or kind" }, { status: 400 });
  }

  const limits = UPLOAD_LIMITS[kind as UploadKind];
  const ext = limits.mimeTypes[file.type];
  if (!ext) {
    return Response.json({ error: "Unsupported file type", code: "invalid_type" }, { status: 415 });
  }
  if (file.size > limits.maxBytes) {
    return Response.json(
      { error: "File too large", code: "too_large", maxBytes: limits.maxBytes },
      { status: 413 },
    );
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const stored = await getStorage().put(buildKey(kind as UploadKind, ext), data, file.type);
  return Response.json(stored, { status: 201 });
}
