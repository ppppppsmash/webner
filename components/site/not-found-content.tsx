"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DEFAULT_LOCALE, isPublicLocale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import { getDictionary } from "@/lib/i18n/public";

/** not-found.tsx receives no props, so the language comes from the URL. */
export function NotFoundContent() {
  const params = useParams<{ locale?: string }>();
  const locale = params.locale && isPublicLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const d = getDictionary(locale);
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-32 text-center">
      <p aria-hidden className="font-display text-7xl text-tint">
        404
      </p>
      <h1 className="text-3xl text-brand">{d.notFound.title}</h1>
      <p className="text-ink-2">{d.notFound.body}</p>
      <Link href={localePath(locale)} className="btn-primary mt-4">
        {d.notFound.cta}
      </Link>
    </section>
  );
}
