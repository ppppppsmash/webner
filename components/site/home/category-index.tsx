import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import { type Locale, pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { PublicDictionary } from "@/lib/i18n/public";
import type { CategoryTree, PublicProduct } from "@/lib/queries/public";

/** Categories as an index, like a table of contents: large names, their sub-categories, the count, one photo. */
export function CategoryIndex({ d, locale, tree, products }: { d: PublicDictionary; locale: Locale; tree: CategoryTree; products: PublicProduct[] }) {
  const parents = tree.filter((c) => c.count > 0 || c.children.length > 0);
  if (!parents.length) return null;

  const imageFor = (ids: Set<string>) => products.find((p) => p.categories.some((c) => ids.has(c.categoryId)))?.images[0]?.url ?? null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <Reveal>
        <h2 className="text-4xl leading-tight text-brand md:text-5xl">{d.home.categoriesTitle}</h2>
        <p className="mt-4 max-w-md text-base text-ink-2 md:text-lg">{d.home.categoriesLead}</p>
      </Reveal>
      <ul className="mt-10 border-t border-brand md:mt-14">
        {parents.map((c) => {
          const image = imageFor(new Set([c.id, ...c.children.map((ch) => ch.id)]));
          return (
            <Reveal as="li" key={c.id} className="border-b border-line">
              <Link href={localePath(locale, `/categories/${c.slug}`)} className="group flex items-center gap-4 py-5 md:gap-8 md:py-7">
                <span className="relative size-16 shrink-0 overflow-hidden bg-paper-2 md:size-24">
                  {image ? <Image src={image} alt="" fill sizes="96px" className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.06]" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-display block text-2xl leading-tight text-brand underline-offset-4 group-hover:underline md:text-4xl">{pickText(c.name, locale)}</span>
                  {c.children.length ? (
                    <span className="mt-1.5 block text-sm leading-relaxed text-ink-2 md:mt-2">{c.children.map((ch) => pickText(ch.name, locale)).join(" · ")}</span>
                  ) : null}
                </span>
                <span className="hidden shrink-0 tabular-nums text-sm text-ink-2 sm:block">{d.products.count(c.count)}</span>
                <ArrowRightIcon aria-hidden className="size-5 shrink-0 text-brand transition-transform duration-200 ease-out group-hover:translate-x-1" strokeWidth={1.5} />
              </Link>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
