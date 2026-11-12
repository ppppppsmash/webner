"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { switchLocalePath } from "@/lib/i18n/paths";
import { cn } from "@/lib/utils";

const SHORT: Record<Locale, string> = { de: "DE", en: "EN", "zh-TW": "繁中", "zh-CN": "简中" };

export function LocaleSwitcher({
  current,
  label,
  className,
  tone = "dark",
}: {
  current: Locale;
  label: string;
  className?: string;
  tone?: "dark" | "light";
}) {
  const pathname = usePathname();
  const light = tone === "light";
  return (
    <nav aria-label={label} className={cn("flex items-center gap-1 text-[0.75rem] tracking-wide", className)}>
      {LOCALES.map((locale, i) => (
        <span key={locale} className="flex items-center">
          {i > 0 ? <span aria-hidden className={cn("mx-1", light ? "text-paper/40" : "text-line")}>|</span> : null}
          <Link
            href={switchLocalePath(pathname, locale)}
            hrefLang={locale}
            aria-current={locale === current ? "true" : undefined}
            className={cn(
              "px-0.5 py-0.5 transition-colors",
              light
                ? locale === current
                  ? "font-semibold text-paper underline underline-offset-4"
                  : "text-paper/75 hover:text-paper"
                : locale === current
                  ? "font-semibold text-brand underline underline-offset-4"
                  : "text-ink-2 hover:text-ink",
            )}
          >
            {SHORT[locale]}
          </Link>
        </span>
      ))}
    </nav>
  );
}
