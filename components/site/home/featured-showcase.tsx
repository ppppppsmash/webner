import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/site/product-card";
import { Reveal } from "@/components/site/reveal";
import { type Locale, pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { PublicDictionary } from "@/lib/i18n/public";
import type { PublicProduct } from "@/lib/queries/public";

/**
 * Recommendations as an editorial spread: the first product large on the left,
 * the heading and the others beside it. Deliberately not four equal cards.
 */
export function FeaturedShowcase({ d, locale, products }: { d: PublicDictionary; locale: Locale; products: PublicProduct[] }) {
  if (!products.length) return null;
  const [lead, ...rest] = products;
  const leadName = pickText(lead.name, locale);
  const leadCategory = lead.categories[0]?.category;
  const leadImage = lead.images[0];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="grid gap-x-10 gap-y-10 lg:grid-cols-12">
        {/* Heading first in the document (and on phones); on desktop it sits to the right of the large product. */}
        <Reveal className="lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:pt-2">
          <h2 className="text-4xl leading-tight text-brand md:text-5xl">{d.home.featuredTitle}</h2>
          <p className="mt-4 max-w-md text-base text-ink-2 md:text-lg">{d.home.featuredLead}</p>
        </Reveal>

        <Reveal className="lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <Link href={localePath(locale, `/products/${lead.slug}`)} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-paper-2 sm:aspect-[3/2] lg:aspect-square">
              {leadImage ? (
                <Image
                  src={leadImage.url}
                  alt={leadImage.alt ?? leadName}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-sm text-ink-2">{d.products.noImage}</div>
              )}
              {lead.badge ? (
                <span className="absolute top-3 left-3 bg-brand px-2.5 py-1 text-xs font-semibold tracking-wider text-paper uppercase">{d.products.badges[lead.badge]}</span>
              ) : null}
            </div>
            <h3 className="mt-5 text-2xl leading-snug text-brand underline-offset-4 group-hover:underline md:text-3xl">{leadName}</h3>
            <p className="mt-2 text-sm text-ink-2">{[leadCategory ? pickText(leadCategory.name, locale) : null, lead.volume].filter(Boolean).join(" · ")}</p>
          </Link>
        </Reveal>

        {rest.length ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 self-end sm:grid-cols-3 md:gap-x-6 lg:col-span-7 lg:col-start-6 lg:row-start-2">
            {rest.slice(0, 3).map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 50} className={i === 2 ? "hidden sm:block" : undefined}>
                <ProductCard product={p} locale={locale} noImageLabel={d.products.noImage} />
              </Reveal>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
