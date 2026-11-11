export const LOCALES = ["de", "en", "zh-TW", "zh-CN"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

export const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

/** BCP 47 tags for <html lang> */
export const HTML_LANG: Record<Locale, string> = { de: "de", en: "en", "zh-TW": "zh-Hant-TW", "zh-CN": "zh-Hans-CN" };

export const LOCALE_LABELS: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  "zh-TW": "繁體中文",
  "zh-CN": "简体中文",
};

/** Text stored per locale. Missing locales fall back to the default locale. */
export type LocalizedText = Partial<Record<Locale, string>>;

export function pickText(text: LocalizedText | null | undefined, locale: Locale = DEFAULT_LOCALE): string {
  if (!text) return "";
  return text[locale] || text[DEFAULT_LOCALE] || LOCALES.map((l) => text[l]).find(Boolean) || "";
}

export function emptyLocalizedText(): Record<Locale, string> {
  return { de: "", en: "", "zh-TW": "", "zh-CN": "" };
}
