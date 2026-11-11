import { CategoryNav } from "@/components/site/category-nav";
import type { Locale } from "@/lib/i18n/locales";
import type { PublicDictionary } from "@/lib/i18n/public";
import type { CategoryTree } from "@/lib/queries/public";

/** Shared frame for /products and /categories/[slug]: heading, sidebar nav, grid. */
export function CatalogLayout({
  d,
  locale,
  tree,
  activeSlug,
  title,
  lead,
  count,
  children,
}: {
  d: PublicDictionary;
  locale: Locale;
  tree: CategoryTree;
  activeSlug: string | null;
  title: string;
  lead?: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-8 md:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <p className="eyebrow">{d.products.title}</p>
          <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{title}</h1>
          {lead ? <p className="mt-3 text-ink-2 md:text-lg">{lead}</p> : null}
        </div>
        <p className="text-sm text-ink-2">{d.products.count(count)}</p>
      </div>
      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <CategoryNav locale={locale} tree={tree} activeSlug={activeSlug} allLabel={d.products.all} heading={d.products.filterBy} />
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
