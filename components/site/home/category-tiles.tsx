import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { type Locale, pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { PublicDictionary } from "@/lib/i18n/public";
import type { CategoryTree, PublicProduct } from "@/lib/queries/public";

/** Category banners: light-blue tiles with a product photo from that category, serif title, sub-categories. */
export function CategoryTiles({ d, locale, tree, products }: { d: PublicDictionary; locale: Locale; tree: CategoryTree; products: PublicProduct[] }) {
  const parents = tree.filter((c) => c.count > 0 || c.children.length > 0);
  if (!parents.length) return null;

  const imageFor = (ids: Set<string>) => products.find((p) => p.categoryId && ids.has(p.categoryId))?.images[0]?.url ?? null;

  return (
    <section className="bg-paper-2">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <Reveal>
          <SectionHeading title={d.home.categoriesTitle} lead={d.home.categoriesLead} />
        </Reveal>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {parents.map((c, i) => {
            const image = imageFor(new Set([c.id, ...c.children.map((ch) => ch.id)]));
            return (
              <Reveal as="li" key={c.id} delay={i * 70}>
                <Link href={localePath(locale, `/categories/${c.slug}`)} className="group flex h-full flex-col bg-paper transition-shadow hover:shadow-[0_14px_30px_-18px_rgba(20,30,60,0.35)]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-tint-soft">
                    {image ? (
                      <Image src={image} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-5 text-center">
                    <h3 className="text-xl text-brand">{pickText(c.name, locale)}</h3>
                    <p className="mt-1 text-xs text-ink-2">{d.products.count(c.count)}</p>
                    {c.children.length ? (
                      <p className="mt-3 text-xs leading-relaxed text-ink-2">{c.children.map((ch) => pickText(ch.name, locale)).join(" · ")}</p>
                    ) : null}
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
