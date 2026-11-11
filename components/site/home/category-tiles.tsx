import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import type { Locale } from "@/lib/i18n/locales";
import { pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { PublicDictionary } from "@/lib/i18n/public";
import type { CategoryTree } from "@/lib/queries/public";

const TILE_TINTS = ["bg-sage", "bg-amber-soft", "bg-[oklch(0.93_0.03_30)]", "bg-[oklch(0.93_0.025_240)]"];

export function CategoryTiles({ d, locale, tree }: { d: PublicDictionary; locale: Locale; tree: CategoryTree }) {
  const parents = tree.filter((c) => c.count > 0 || c.children.length > 0);
  if (!parents.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <Reveal>
        <SectionHeading title={d.home.categoriesTitle} lead={d.home.categoriesLead} />
      </Reveal>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {parents.map((c, i) => (
          <Reveal as="li" key={c.id} delay={i * 80}>
            <Link
              href={localePath(locale, `/categories/${c.slug}`)}
              className={`group flex h-full min-h-56 flex-col justify-between rounded-2xl p-5 transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 ${TILE_TINTS[i % TILE_TINTS.length]}`}
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-4xl text-ink/30">0{i + 1}</span>
                <ArrowUpRightIcon className="size-5 text-ink/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div>
                <h3 className="text-2xl leading-tight">{pickText(c.name, locale)}</h3>
                <p className="mt-1 text-xs text-ink-2">{d.products.count(c.count)}</p>
                {c.children.length ? (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {c.children.slice(0, 4).map((ch) => (
                      <li key={ch.id} className="rounded-full border border-ink/15 px-2 py-0.5 text-[0.7rem] text-ink-2">
                        {pickText(ch.name, locale)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
