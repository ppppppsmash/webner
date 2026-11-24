import { ArrowUpRightIcon } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import type { PublicDictionary } from "@/lib/i18n/public";

/** Closing band: where to buy, with the one outbound action of the page. */
export function ShopBanner({ d, shopUrl }: { d: PublicDictionary; shopUrl: string }) {
  return (
    <section className="bg-tint-soft">
      <Reveal className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 md:flex-row md:items-end md:justify-between md:py-24">
        <div>
          <h2 className="max-w-xl text-4xl leading-tight text-brand md:text-5xl">{d.home.shopBannerTitle}</h2>
          <p className="mt-4 max-w-md text-base text-ink-2 md:text-lg">{d.home.shopBannerBody}</p>
        </div>
        <a href={shopUrl} target="_blank" rel="noreferrer" data-track-shop="" className="btn-primary shrink-0 self-start md:self-auto">
          {d.home.shopBannerCta}
          <ArrowUpRightIcon className="size-4" />
        </a>
      </Reveal>
    </section>
  );
}
