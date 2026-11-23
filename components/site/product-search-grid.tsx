"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ProductGrid } from "@/components/site/product-grid";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import { getDictionary } from "@/lib/i18n/public";
import type { PublicProduct } from "@/lib/queries/public";

/** Listing with the header search box applied (?q=…), filtered in the browser so the page stays cacheable. */
export function ProductSearchGrid({
  products,
  locale,
  emptyLabel,
  noImageLabel,
}: {
  products: PublicProduct[];
  locale: Locale;
  emptyLabel: string;
  noImageLabel: string;
}) {
  const { searchResults: resultLabel, searchEmpty, searchReset } = getDictionary(locale).products;
  const q = (useSearchParams().get("q") ?? "").trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return products;
    return products.filter((p) =>
      LOCALES.some((l) => (p.name[l] ?? "").toLowerCase().includes(q) || (p.summary[l] ?? "").toLowerCase().includes(q)),
    );
  }, [products, q]);

  return (
    <>
      {q ? <p className="mb-4 text-sm text-ink-2">{resultLabel(filtered.length, q)}</p> : null}
      {q && !filtered.length ? (
        // A search without hits is not an empty category: say so and offer the way back.
        <div className="flex flex-col items-center gap-5 border border-dashed border-line px-6 py-16 text-center text-ink-2">
          <p>{searchEmpty}</p>
          <Link href={localePath(locale, "/products")} className="btn-outline">
            {searchReset}
          </Link>
        </div>
      ) : (
        <ProductGrid products={filtered} locale={locale} emptyLabel={emptyLabel} noImageLabel={noImageLabel} />
      )}
    </>
  );
}
