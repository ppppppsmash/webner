import Link from "next/link";
import { ProductCard } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { PublicDictionary } from "@/lib/i18n/public";
import type { PublicProduct } from "@/lib/queries/public";

export function ProductSection({ d, locale, title, lead, products }: { d: PublicDictionary; locale: Locale; title: string; lead?: string; products: PublicProduct[] }) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <Reveal>
        <SectionHeading title={title} lead={lead} />
      </Reveal>
      <ul className="mt-10 grid grid-cols-2 gap-x-2 gap-y-6 md:gap-x-4 lg:grid-cols-4">
        {products.map((p, i) => (
          <Reveal as="li" key={p.id} delay={i * 50}>
            <ProductCard product={p} locale={locale} noImageLabel={d.products.noImage} detailsLabel={d.products.details} />
          </Reveal>
        ))}
      </ul>
      <div className="mt-10 text-center">
        <Link href={localePath(locale, "/products")} className="btn-outline">
          {d.home.viewAll}
        </Link>
      </div>
    </section>
  );
}
