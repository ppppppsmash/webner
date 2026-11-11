import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { PublicDictionary } from "@/lib/i18n/public";
import type { PublicProduct } from "@/lib/queries/public";

/**
 * Asymmetric hero: editorial copy on the left, a staggered pair of product
 * images on the right floating over an amber "oil drop" blob.
 */
export function Hero({ d, locale, products }: { d: PublicDictionary; locale: Locale; products: PublicProduct[] }) {
  const [a, b] = products;

  return (
    <section className="grain relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] size-[42rem] rounded-full bg-amber-soft blur-3xl"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-16 pb-20 md:grid-cols-[1.1fr_0.9fr] md:pt-24 md:pb-28">
        <div className="relative z-10">
          <p className="eyebrow rise" style={{ "--rise-delay": "0ms" } as React.CSSProperties}>
            {d.hero.eyebrow}
          </p>
          <h1
            className="rise mt-5 max-w-2xl text-[2.6rem] leading-[1.05] text-ink md:text-6xl"
            style={{ "--rise-delay": "120ms" } as React.CSSProperties}
          >
            {d.hero.title}
          </h1>
          <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-ink-2" style={{ "--rise-delay": "240ms" } as React.CSSProperties}>
            {d.hero.lead}
          </p>
          <div className="rise mt-9 flex flex-wrap items-center gap-3" style={{ "--rise-delay": "360ms" } as React.CSSProperties}>
            <Link href={localePath(locale, "/products")} className="btn-primary">
              {d.hero.ctaProducts}
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link href={localePath(locale, "/about")} className="btn-outline">
              {d.hero.ctaStory}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto h-[26rem] w-full max-w-md md:h-[32rem]" aria-hidden={!a}>
          <div className="absolute inset-x-8 top-6 bottom-0 rounded-[45%_55%_50%_50%/55%_45%_55%_45%] bg-amber/25" />
          {a?.images[0] ? (
            <Link
              href={localePath(locale, `/products/${a.slug}`)}
              className="rise absolute top-0 left-0 w-[62%] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(40,60,45,0.45)]"
              style={{ "--rise-delay": "200ms" } as React.CSSProperties}
            >
              <Image src={a.images[0].url} alt={pickText(a.name, locale)} width={720} height={900} priority className="aspect-[4/5] object-cover" />
            </Link>
          ) : null}
          {b?.images[0] ? (
            <Link
              href={localePath(locale, `/products/${b.slug}`)}
              className="rise absolute right-0 bottom-0 w-[52%] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(40,60,45,0.45)]"
              style={{ "--rise-delay": "380ms" } as React.CSSProperties}
            >
              <Image src={b.images[0].url} alt={pickText(b.name, locale)} width={600} height={750} priority className="aspect-[4/5] object-cover" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
