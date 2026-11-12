"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ProductGrid } from "@/components/site/product-grid";
import { LOCALES, type Locale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/public";
import type { PublicProduct } from "@/lib/queries/public";

/** Listing with the header search box applied (?q=…), filtered in the browser so the page stays cacheable. */
export function ProductSearchGrid({
  products,
  locale,
  emptyLabel,
  noImageLabel,
  detailsLabel,
}: {
  products: PublicProduct[];
  locale: Locale;
  emptyLabel: string;
  noImageLabel: string;
  detailsLabel?: string;
}) {
  const resultLabel = getDictionary(locale).products.searchResults;
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
      <ProductGrid products={filtered} locale={locale} emptyLabel={emptyLabel} noImageLabel={noImageLabel} detailsLabel={detailsLabel} />
    </>
  );
}
