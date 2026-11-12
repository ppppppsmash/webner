import { ArrowUpRightIcon } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import type { PublicDictionary } from "@/lib/i18n/public";

/** Light-blue band pointing to the partner shop. */
export function ShopBanner({ d, shopUrl }: { d: PublicDictionary; shopUrl: string }) {
  return (
    <section className="bg-tint-soft">
      <Reveal className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-14 text-center md:py-16">
        <h2 className="section-title">{d.home.shopBannerTitle}</h2>
        <p className="max-w-xl text-ink-2">{d.home.shopBannerBody}</p>
        <a href={shopUrl} target="_blank" rel="noreferrer" className="btn-primary">
          {d.home.shopBannerCta}
          <ArrowUpRightIcon className="size-4" />
        </a>
      </Reveal>
    </section>
  );
}
