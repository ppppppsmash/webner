import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";

/** Absolute URL of a public product page. In the browser it uses the current origin (site and admin share a domain). */
export function publicProductUrl(slug: string, locale: Locale = DEFAULT_LOCALE): string {
  const path = localePath(locale, `/products/${slug}`);
  const origin =
    typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.AUTH_URL ?? "");
  return `${origin.replace(/\/$/, "")}${path}`;
}
