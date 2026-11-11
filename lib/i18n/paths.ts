import type { Locale } from "./locales";

/** Prefixes a site path with the locale: localePath("de", "/products") → "/de/products" */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Swaps the locale segment of a localized pathname. */
export function switchLocalePath(pathname: string, locale: Locale): string {
  const rest = pathname.replace(/^\/(de|en|zh-TW|zh-CN)(?=\/|$)/, "");
  return localePath(locale, rest || "/");
}
