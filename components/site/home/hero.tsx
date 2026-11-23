import Image from "next/image";
import Link from "next/link";
import { type Locale, pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { PublicDictionary } from "@/lib/i18n/public";
import type { PublicProduct } from "@/lib/queries/public";

/**
 * First screen. The stage is the collection itself: a staggered wall of product photos that
 * runs off the top, bottom and right edge, with the headline anchored on the left.
 * A photo uploaded in the management panel replaces the wall with one full-bleed picture.
 */
export function Hero({ d, locale, imageUrl, products }: { d: PublicDictionary; locale: Locale; imageUrl: string | null; products: PublicProduct[] }) {
  if (imageUrl) return <PhotoHero d={d} locale={locale} imageUrl={imageUrl} />;

  const picks = products.filter((p) => p.images[0]).slice(0, 9);
  const wall = picks.length >= 6;
  // Three columns, filled round-robin so each shows a mix of categories.
  const columns = [0, 1, 2].map((c) => picks.filter((_, i) => i % 3 === c));
  // Each column starts at a different height, so the wall never reads as a grid.
  const offsets = ["lg:-translate-y-[9%]", "lg:translate-y-[5%]", "lg:-translate-y-[21%]"];

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="mx-auto max-w-6xl px-6">
        <div className="pt-14 pb-12 md:pt-20 lg:flex lg:min-h-[min(46rem,calc(100svh-10.25rem))] lg:w-[46%] lg:flex-col lg:justify-center lg:py-24">
          <h1 className="rise text-[2.75rem] leading-[1.05] text-brand md:text-6xl xl:text-7xl">{d.hero.title}</h1>
          <p className="rise mt-6 max-w-md text-base leading-relaxed text-ink-2 md:mt-8 md:text-lg" style={{ "--rise-delay": "100ms" } as React.CSSProperties}>
            {d.hero.lead}
          </p>
          <div className="rise mt-9 flex flex-wrap items-center gap-3 md:mt-10" style={{ "--rise-delay": "200ms" } as React.CSSProperties}>
            <Link href={localePath(locale, "/products")} className="btn-primary">
              {d.hero.ctaProducts}
            </Link>
            <Link href={localePath(locale, "/about")} className="btn-outline">
              {d.hero.ctaStory}
            </Link>
          </div>
        </div>
      </div>

      {wall ? (
        <>
          {/* Desktop: the wall, bleeding off three edges. Decorative duplicate of the products below, so it is kept out of the tab order. */}
          <div aria-hidden className="absolute inset-y-0 left-[53%] hidden w-[50%] grid-cols-3 gap-4 lg:grid">
            {columns.map((column, c) => (
              <div key={c} className={`flex flex-col gap-4 ${offsets[c]}`}>
                {column.map((p, i) => (
                  <Link
                    key={p.id}
                    href={localePath(locale, `/products/${p.slug}`)}
                    tabIndex={-1}
                    className="rise group relative block aspect-[4/5] shrink-0 overflow-hidden bg-paper-2"
                    style={{ "--rise-delay": `${150 + (c + i) * 80}ms` } as React.CSSProperties}
                  >
                    <Image
                      src={p.images[0].url}
                      alt=""
                      fill
                      priority={i < 2}
                      sizes="(min-width: 1024px) 17vw, 0px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Phone and tablet: one row of the same photos, running off the right edge. */}
          <ul className="flex gap-3 overflow-x-auto overscroll-x-contain px-6 pb-12 [scrollbar-width:none] lg:hidden">
            {picks.slice(0, 6).map((p, i) => (
              <li key={p.id} className="w-[42%] shrink-0 sm:w-[28%]">
                <Link href={localePath(locale, `/products/${p.slug}`)} className="relative block aspect-[4/5] overflow-hidden bg-paper-2">
                  <Image src={p.images[0].url} alt={pickText(p.name, locale)} fill priority={i < 3} sizes="(min-width: 640px) 28vw, 42vw" className="object-cover" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

/** Variant with an uploaded photo: full bleed, text on a navy scrim so it stays readable on any picture. */
function PhotoHero({ d, locale, imageUrl }: { d: PublicDictionary; locale: Locale; imageUrl: string }) {
  return (
    <section className="on-dark relative isolate flex min-h-[34rem] items-center overflow-hidden bg-brand-deep text-paper lg:min-h-[min(46rem,calc(100svh-10.25rem))]">
      <Image src={imageUrl} alt="" fill priority sizes="100vw" className="object-cover" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-brand-deep/85 via-brand-deep/55 to-brand-deep/10" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20">
        <h1 className="rise max-w-2xl text-[2.75rem] leading-[1.05] text-paper md:text-6xl xl:text-7xl">{d.hero.title}</h1>
        <p className="rise mt-6 max-w-md text-base leading-relaxed text-paper/90 md:mt-8 md:text-lg" style={{ "--rise-delay": "100ms" } as React.CSSProperties}>
          {d.hero.lead}
        </p>
        <div className="rise mt-9 flex flex-wrap items-center gap-3 md:mt-10" style={{ "--rise-delay": "200ms" } as React.CSSProperties}>
          <Link href={localePath(locale, "/products")} className="btn-light">
            {d.hero.ctaProducts}
          </Link>
          <Link href={localePath(locale, "/about")} className="btn-ghost-light">
            {d.hero.ctaStory}
          </Link>
        </div>
      </div>
    </section>
  );
}
