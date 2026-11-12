import { Reveal } from "@/components/site/reveal";
import type { PublicDictionary } from "@/lib/i18n/public";

/** Centred brand statement (serif italic lead + short body), as on German brand homepages. */
export function Story({ d }: { d: PublicDictionary }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
      <Reveal>
        <p className="eyebrow">{d.story.eyebrow}</p>
        <h2 className="font-display mt-4 text-2xl leading-snug text-brand italic md:text-[2rem]">{d.story.title}</h2>
      </Reveal>
      <Reveal delay={120} className="mt-6 space-y-4 text-base leading-relaxed text-ink-2">
        {d.story.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </Reveal>
    </section>
  );
}
