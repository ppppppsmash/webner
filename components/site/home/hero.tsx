import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { PublicDictionary } from "@/lib/i18n/public";

/**
 * Full-bleed photographic hero: the image comes from site settings (uploaded in the
 * management panel) and falls back to a product image or a navy gradient.
 */
export function Hero({ d, locale, imageUrl }: { d: PublicDictionary; locale: Locale; imageUrl: string | null }) {
  return (
    <section className="relative isolate flex min-h-[32rem] items-center overflow-hidden bg-brand-deep text-paper md:min-h-[38rem]">
      {imageUrl ? (
        <Image src={imageUrl} alt="" fill priority sizes="100vw" className="object-cover" />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_15%,oklch(0.45_0.09_272),transparent_55%),radial-gradient(ellipse_at_85%_90%,oklch(0.4_0.08_240),transparent_50%),linear-gradient(180deg,oklch(0.3_0.065_272),oklch(0.25_0.055_272))]"
        />
      )}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-deep/80 via-brand-deep/35 to-brand-deep/20" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 text-center">
        <p className="rise text-[0.72rem] font-semibold tracking-[0.2em] text-paper/80 uppercase">{d.hero.eyebrow}</p>
        <h1 className="rise mx-auto mt-5 max-w-3xl text-4xl leading-[1.1] text-paper md:text-6xl" style={{ "--rise-delay": "120ms" } as React.CSSProperties}>
          {d.hero.title}
        </h1>
        <p className="rise mx-auto mt-6 max-w-xl text-base leading-relaxed text-paper/85 md:text-lg" style={{ "--rise-delay": "240ms" } as React.CSSProperties}>
          {d.hero.lead}
        </p>
        <div className="rise mt-9 flex flex-wrap items-center justify-center gap-3" style={{ "--rise-delay": "360ms" } as React.CSSProperties}>
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
