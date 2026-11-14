import { z } from "zod";
import { LOCALES, type LocalizedText } from "@/lib/i18n/locales";

/** Short text per locale with a per-locale character limit. */
export const localizedTextSchemaWithMax = (max: number) =>
  z.object({
    de: z.string().trim().max(max).default(""),
    en: z.string().trim().max(max).default(""),
    "zh-TW": z.string().trim().max(max).default(""),
    "zh-CN": z.string().trim().max(max).default(""),
  });

export const localizedTextSchema = localizedTextSchemaWithMax(500);

/** Long text (rich text HTML) per locale */
export const localizedRichTextSchema = z.object({
  de: z.string().max(200_000).default(""),
  en: z.string().max(200_000).default(""),
  "zh-TW": z.string().max(200_000).default(""),
  "zh-CN": z.string().max(200_000).default(""),
});

export const hasAnyText = (value: LocalizedText) => LOCALES.some((l) => (value[l] ?? "").trim().length > 0);

/** Drops empty strings so the database only stores filled locales. */
export function compactLocalized(value: LocalizedText): LocalizedText {
  const out: LocalizedText = {};
  for (const l of LOCALES) {
    const v = value[l]?.trim();
    if (v) out[l] = v;
  }
  return out;
}

/** Rich text: keeps content that still has text after stripping tags. */
export function compactRichText(value: LocalizedText): LocalizedText {
  const out: LocalizedText = {};
  for (const l of LOCALES) {
    const v = value[l] ?? "";
    const plain = v.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    if (plain || /<(img|iframe|video)\b/i.test(v)) out[l] = v;
  }
  return out;
}
