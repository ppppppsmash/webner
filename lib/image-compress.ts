"use client";

/**
 * Shrinks a photo in the browser before it is uploaded.
 *
 * Why: files were stored exactly as they came off the camera (up to 10 MB). Every page that shows them
 * then pays for it — the image optimizer has to fetch the whole original before it can produce a small
 * version (slow on the first view, and it gives up after 7 s), the management screens and images inside
 * product descriptions load the original as is.
 *
 * What it does: scales the longest side down to MAX_EDGE and re-encodes as WebP (JPEG / PNG where the
 * browser cannot encode WebP). The original is kept whenever the result would not be clearly smaller.
 */

/** Longest side after resizing. Covers a full-width hero on a 2× laptop screen. */
const MAX_EDGE = 2560;
const QUALITY = 0.82;
/** Not worth touching: already small. */
const SKIP_BELOW_BYTES = 200 * 1024;
/** Animated or already well-compressed formats are left alone. */
const COMPRESSIBLE = new Set(["image/jpeg", "image/png", "image/webp"]);

const EXTENSIONS: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

/** Returns a smaller version of the image, or the file itself when nothing is gained (or anything goes wrong). */
export async function compressImage(file: File): Promise<File> {
  if (!COMPRESSIBLE.has(file.type) || typeof createImageBitmap !== "function") return file;

  let bitmap: ImageBitmap;
  try {
    // from-image: phone photos carry their rotation in EXIF; without this they would come out sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < SKIP_BELOW_BYTES) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    // WebP keeps transparency and beats JPEG/PNG on size. Browsers that cannot encode it (Safari)
    // silently hand back a PNG, so the result type is checked and the source format is used instead.
    let blob = await encode(canvas, "image/webp");
    if (!blob || blob.type !== "image/webp") {
      const fallback = file.type === "image/png" ? "image/png" : "image/jpeg";
      blob = await encode(canvas, fallback);
      if (!blob || blob.type !== fallback) return file;
    }

    // Keep the original unless the saving is real (at least 10 %).
    if (blob.size > file.size * 0.9) return file;

    const base = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${base}.${EXTENSIONS[blob.type]}`, { type: blob.type, lastModified: file.lastModified });
  } catch {
    return file;
  } finally {
    bitmap.close();
  }
}
