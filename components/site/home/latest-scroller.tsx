import Link from "next/link";
import { ProductCard } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { PublicDictionary } from "@/lib/i18n/public";
import type { PublicProduct } from "@/lib/queries/public";

/** New products in one row that scrolls sideways and runs off both viewport edges. */
export function LatestScroller({ d, locale, products }: { d: PublicDictionary; locale: Locale; products: PublicProduct[] }) {
  if (!products.length) return null;
  // First card starts on the page gutter; the row itself is full width.
  const gutter = "max(1.5rem, calc((100vw - 72rem) / 2 + 1.5rem))";
  return (
    <section className="bg-paper-2 py-20 md:py-28">
      <Reveal className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-x-8 gap-y-4 px-6">
        <h2 className="text-4xl leading-tight text-brand md:text-5xl">{d.home.latestTitle}</h2>
        <Link href={localePath(locale, "/products")} className="btn-outline">
          {d.home.viewAll}
        </Link>
      </Reveal>
      <ul
        className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 [scrollbar-width:thin] md:mt-14 md:gap-6"
        style={{ paddingInline: gutter, scrollPaddingInline: gutter }}
      >
        {products.map((p) => (
          <li key={p.id} className="w-[62%] shrink-0 snap-start sm:w-[38%] lg:w-[17rem]">
            <ProductCard product={p} locale={locale} noImageLabel={d.products.noImage} />
          </li>
        ))}
      </ul>
    </section>
  );
}
