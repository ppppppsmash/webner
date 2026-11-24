export const LOCALES = ["de", "en", "zh-TW", "zh-CN"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

export const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

/**
 * Languages kept in the data and in the management forms but not offered on the public site.
 * Traditional Chinese is hidden at the client's request; empty this list to bring it back.
 */
const HIDDEN_PUBLIC_LOCALES: readonly Locale[] = ["zh-TW"];

/** Languages the public site is served in: URLs, language switcher, hreflang, search. */
export const PUBLIC_LOCALES: readonly Locale[] = LOCALES.filter((l) => !HIDDEN_PUBLIC_LOCALES.includes(l));

export const isPublicLocale = (value: string): value is Locale => (PUBLIC_LOCALES as readonly string[]).includes(value);

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
