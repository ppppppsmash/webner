import type { LocalizedText } from "@/lib/i18n/locales";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics (ä -> a)
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Builds a slug from the latin names first (en, de); falls back to a random suffix for CJK-only names. */
export function slugFromName(name: LocalizedText, fallback = "item"): string {
  const base = slugify(name.en || name.de || "") || fallback;
  const latinOnly = /[a-z]/.test(base);
  return latinOnly && base !== fallback ? base : `${fallback}-${crypto.randomUUID().slice(0, 8)}`;
}
