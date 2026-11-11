import { ArrowRightIcon } from "lucide-react";
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
  tone = "paper",
}: {
  d: PublicDictionary;
  locale: Locale;
  title: string;
  lead?: string;
  products: PublicProduct[];
  tone?: "paper" | "paper-2";
}) {
  if (!products.length) return null;
  return (
    <section className={tone === "paper-2" ? "bg-paper-2" : undefined}>
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title={title} lead={lead} />
          <Link href={localePath(locale, "/products")} className="group inline-flex items-center gap-1.5 text-sm font-medium text-moss">
            {d.home.viewAll}
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">
          {products.map((p, i) => (
            <Reveal as="li" key={p.id} delay={i * 60}>
              <ProductCard product={p} locale={locale} noImageLabel={d.products.noImage} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
