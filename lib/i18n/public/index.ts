import type { Locale } from "@/lib/i18n/locales";
import { de } from "./de";
import { en } from "./en";
import type { PublicDictionary } from "./types";
import { zhCN } from "./zh-CN";
import { zhTW } from "./zh-TW";

export type { PublicDictionary } from "./types";

const dictionaries: Record<Locale, PublicDictionary> = { de, en, "zh-TW": zhTW, "zh-CN": zhCN };

export function getDictionary(locale: Locale): PublicDictionary {
  return dictionaries[locale];
}
