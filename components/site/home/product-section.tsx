import Link from "next/link";
import { ProductCard } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { PublicDictionary } from "@/lib/i18n/public";
import type { PublicProduct } from "@/lib/queries/public";

export function ProductSection({
  d,
  locale,
  title,
  lead,
  products,
  showAllLink = true,
}: {
  d: PublicDictionary;
  locale: Locale;
  title: string;
  lead?: string;
  products: PublicProduct[];
  showAllLink?: boolean;
}) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <Reveal>
        <SectionHeading title={title} lead={lead} />
      </Reveal>
      <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
        {products.map((p, i) => (
          <Reveal as="li" key={p.id} delay={i * 50}>
            <ProductCard product={p} locale={locale} noImageLabel={d.products.noImage} />
          </Reveal>
        ))}
      </ul>
      {showAllLink ? (
        <div className="mt-10 text-center">
          <Link href={localePath(locale, "/products")} className="btn-outline">
            {d.home.viewAll}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
