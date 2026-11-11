import { Reveal } from "@/components/site/reveal";
import type { PublicDictionary } from "@/lib/i18n/public";

export function Story({ d }: { d: PublicDictionary }) {
  return (
    <section className="grain relative bg-paper-2">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
        <Reveal>
          <p className="eyebrow">{d.story.eyebrow}</p>
          <h2 className="mt-4 text-3xl leading-tight md:text-5xl">{d.story.title}</h2>
        </Reveal>
        <Reveal delay={120} className="mt-8 space-y-5 text-base leading-relaxed text-ink-2 md:text-lg">
          {d.story.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </Reveal>
        <Reveal delay={200} className="mt-10 flex justify-center">
          <span aria-hidden className="h-px w-16 bg-amber" />
        </Reveal>
      </div>
    </section>
  );
}
