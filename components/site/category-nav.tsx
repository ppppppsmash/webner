import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { CategoryTree } from "@/lib/queries/public";
import { cn } from "@/lib/utils";

/**
 * Category filter: a horizontally scrollable chip row on mobile, a grouped list on desktop.
 * Pure links (no client state) so the pages stay cacheable.
 */
export function CategoryNav({
  locale,
  tree,
  activeSlug,
  allLabel,
  heading,
}: {
  locale: Locale;
  tree: CategoryTree;
  activeSlug: string | null;
  allLabel: string;
  heading: string;
}) {
  const chip = (key: string, href: string, label: string, active: boolean, muted = false) => (
    <Link
      key={key}
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active ? "border-moss bg-moss text-paper" : "border-line text-ink hover:border-moss hover:text-moss",
        muted && !active && "text-ink-2",
      )}
    >
      {label}
    </Link>
  );

  return (
    <nav aria-label={heading} className="min-w-0 lg:sticky lg:top-28">
      <h2 className="footer-title hidden lg:block">{heading}</h2>
      {/* mobile / tablet: chips */}
      <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 [touch-action:pan-y] [scrollbar-width:none] lg:hidden">
        {chip("all", localePath(locale, "/products"), allLabel, activeSlug === null)}
        {tree.flatMap((c) => [
          chip(c.id, localePath(locale, `/categories/${c.slug}`), pickText(c.name, locale), activeSlug === c.slug),
          ...c.children.map((ch) => chip(ch.id, localePath(locale, `/categories/${ch.slug}`), pickText(ch.name, locale), activeSlug === ch.slug, true)),
        ])}
      </div>
      {/* desktop: grouped list */}
      <ul className="hidden space-y-5 text-sm lg:block">
        <li>
          <Link
            href={localePath(locale, "/products")}
            aria-current={activeSlug === null ? "page" : undefined}
            className={cn("font-medium hover:text-moss", activeSlug === null && "text-moss underline decoration-amber decoration-2 underline-offset-4")}
          >
            {allLabel}
          </Link>
        </li>
        {tree.map((c) => (
          <li key={c.id}>
            <Link
              href={localePath(locale, `/categories/${c.slug}`)}
              aria-current={activeSlug === c.slug ? "page" : undefined}
              className={cn("font-medium hover:text-moss", activeSlug === c.slug && "text-moss underline decoration-amber decoration-2 underline-offset-4")}
            >
              {pickText(c.name, locale)}
              <span className="ml-1.5 text-xs text-ink-2">{c.count}</span>
            </Link>
            {c.children.length ? (
              <ul className="mt-2 space-y-1.5 border-l border-line pl-3">
                {c.children.map((ch) => (
                  <li key={ch.id}>
                    <Link
                      href={localePath(locale, `/categories/${ch.slug}`)}
                      aria-current={activeSlug === ch.slug ? "page" : undefined}
                      className={cn("text-ink-2 hover:text-moss", activeSlug === ch.slug && "text-moss underline decoration-amber decoration-2 underline-offset-4")}
                    >
                      {pickText(ch.name, locale)}
                      <span className="ml-1.5 text-xs">{ch.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
