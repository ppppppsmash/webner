import { Reveal } from "@/components/site/reveal";
import type { PublicDictionary } from "@/lib/i18n/public";

/** Centred brand statement (serif italic lead + short body), as on German brand homepages. */
export function Story({ d }: { d: PublicDictionary }) {
  return (
    <section className="mx-auto max-w-3xl px-6 pt-8 pb-24 text-center md:pt-16 md:pb-40">
      <Reveal>
        <p className="eyebrow">{d.story.eyebrow}</p>
        <h2 className="font-display mt-4 text-2xl leading-snug text-brand italic md:text-4xl md:leading-snug">{d.story.title}</h2>
      </Reveal>
      <Reveal delay={120} className="mt-8 space-y-4 text-base leading-relaxed text-pretty text-ink-2">
        {d.story.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </Reveal>
    </section>
  );
}
