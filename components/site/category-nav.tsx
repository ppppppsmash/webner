import Link from "next/link";
import { type Locale, pickText } from "@/lib/i18n/locales";
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
        "inline-flex shrink-0 items-center border px-3.5 py-1.5 text-sm transition-colors",
        active ? "border-brand bg-brand text-paper" : "border-line text-ink hover:border-brand hover:text-brand",
        muted && !active && "text-ink-2",
      )}
    >
      {label}
    </Link>
  );

  const item = (href: string, label: string, active: boolean, count?: number, sub = false) => (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center justify-between gap-2 py-1 hover:text-brand",
        sub ? "text-ink-2" : "font-medium text-ink",
        active && "text-brand",
      )}
    >
      <span className={cn(active && "underline decoration-tint decoration-2 underline-offset-4")}>{label}</span>
      {count !== undefined ? <span className="text-xs text-ink-2">{count}</span> : null}
    </Link>
  );

  return (
    <nav aria-label={heading} className="min-w-0 lg:sticky lg:top-6">
      <h2 className="footer-title hidden border-b border-line pb-2 lg:block">{heading}</h2>
      <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 [touch-action:pan-y] [scrollbar-width:none] lg:hidden">
        {chip("all", localePath(locale, "/products"), allLabel, activeSlug === null)}
        {tree.flatMap((c) => [
          chip(c.id, localePath(locale, `/categories/${c.slug}`), pickText(c.name, locale), activeSlug === c.slug),
          ...c.children.map((ch) => chip(ch.id, localePath(locale, `/categories/${ch.slug}`), pickText(ch.name, locale), activeSlug === ch.slug, true)),
        ])}
      </div>
      <ul className="hidden space-y-4 text-sm lg:block">
        <li>{item(localePath(locale, "/products"), allLabel, activeSlug === null)}</li>
        {tree.map((c) => (
          <li key={c.id}>
            {item(localePath(locale, `/categories/${c.slug}`), pickText(c.name, locale), activeSlug === c.slug, c.count)}
            {c.children.length ? (
              <ul className="mt-1 ml-3 border-l border-line pl-3">
                {c.children.map((ch) => (
                  <li key={ch.id}>
                    {item(localePath(locale, `/categories/${ch.slug}`), pickText(ch.name, locale), activeSlug === ch.slug, ch.count, true)}
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
