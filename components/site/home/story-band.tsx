import Link from "next/link";
import { Reveal } from "@/components/site/reveal";
import type { Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { PublicDictionary } from "@/lib/i18n/public";

/** The one navy band of the page: the brand statement, large, with the story beside it. */
export function StoryBand({ d, locale }: { d: PublicDictionary; locale: Locale }) {
  return (
    <section className="on-dark bg-brand-deep text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 md:py-36 lg:grid-cols-12 lg:gap-x-10">
        <Reveal className="lg:col-span-7">
          <p className="text-xs font-semibold tracking-[0.1em] text-paper/80 uppercase">{d.story.eyebrow}</p>
          <h2 className="mt-5 text-4xl leading-[1.1] text-paper italic md:text-6xl">{d.story.title}</h2>
        </Reveal>
        <Reveal delay={100} className="lg:col-span-5 lg:pt-10">
          <div className="space-y-4 text-base leading-relaxed text-paper/85">
            {d.story.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <Link href={localePath(locale, "/about")} className="btn-ghost-light mt-8">
            {d.hero.ctaStory}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
