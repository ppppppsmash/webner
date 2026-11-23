import { Suspense } from "react";
import { CategoryNav } from "@/components/site/category-nav";
import { HideWhileSearching } from "@/components/site/search-input";
import type { Locale } from "@/lib/i18n/locales";
import type { PublicDictionary } from "@/lib/i18n/public";
import type { CategoryTree } from "@/lib/queries/public";

/** Shared frame for /products and /categories/[slug]: centred title, sidebar nav, grid. */
export function CatalogLayout({
  d,
  locale,
  tree,
  activeSlug,
  title,
  lead,
  count,
  searchable = false,
  children,
}: {
  d: PublicDictionary;
  locale: Locale;
  tree: CategoryTree;
  activeSlug: string | null;
  title: string;
  lead?: string;
  count: number;
  /** The listing reacts to ?q=… (only /products). */
  searchable?: boolean;
  children: React.ReactNode;
}) {
  const countLine = <p className="mt-2 text-sm text-ink-2">{d.products.count(count)}</p>;
  return (
    <section className="mx-auto max-w-6xl px-6 pt-10 pb-8 md:pt-14">
      <div className="text-center">
        {lead ? <p className="eyebrow">{lead}</p> : <p className="eyebrow">{d.products.title}</p>}
        <h1 className="mt-2 text-3xl text-brand md:text-4xl">{title}</h1>
        {searchable ? (
          // The total would contradict "0 results" while a search is shown.
          <Suspense fallback={countLine}>
            <HideWhileSearching>{countLine}</HideWhileSearching>
          </Suspense>
        ) : (
          countLine
        )}
        <span aria-hidden className="mx-auto mt-4 block h-px w-12 bg-tint" />
      </div>
      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <CategoryNav locale={locale} tree={tree} activeSlug={activeSlug} allLabel={d.products.all} heading={d.products.filterBy} />
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
