import { ArrowUpRightIcon } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import type { PublicDictionary } from "@/lib/i18n/public";

export function ShopBanner({ d, shopUrl }: { d: PublicDictionary; shopUrl: string }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-4">
      <Reveal className="grain relative overflow-hidden rounded-3xl bg-moss-deep px-8 py-14 text-paper md:px-16 md:py-20">
        <div aria-hidden className="pointer-events-none absolute -right-20 -bottom-32 size-96 rounded-full bg-amber/30 blur-3xl" />
        <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl leading-tight text-paper md:text-4xl">{d.home.shopBannerTitle}</h2>
            <p className="mt-3 text-paper/75">{d.home.shopBannerBody}</p>
          </div>
          <a
            href={shopUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
          >
            {d.home.shopBannerCta}
            <ArrowUpRightIcon className="size-4" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
