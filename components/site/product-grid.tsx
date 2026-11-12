import { ProductCard } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";
import type { Locale } from "@/lib/i18n/locales";
import type { PublicProduct } from "@/lib/queries/public";

export function ProductGrid({
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
  if (!products.length) {
    return <p className="border border-dashed border-line px-6 py-16 text-center text-ink-2">{emptyLabel}</p>;
  }
  return (
    <ul className="grid grid-cols-2 gap-x-2 gap-y-6 md:gap-x-4 xl:grid-cols-3">
      {products.map((p, i) => (
        <Reveal as="li" key={p.id} delay={Math.min(i, 5) * 50}>
          <ProductCard product={p} locale={locale} noImageLabel={noImageLabel} detailsLabel={detailsLabel} priority={i < 3} />
        </Reveal>
      ))}
    </ul>
  );
}
