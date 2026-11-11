import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/site/reveal";
import { Values } from "@/components/site/home/values";
import { isLocale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return { title: d.about.title, description: d.about.lead };
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);

  return (
    <>
      <section className="grain relative overflow-hidden bg-paper-2">
        <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 size-[30rem] rounded-full bg-amber-soft blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
          <p className="eyebrow rise">{d.story.eyebrow}</p>
          <h1 className="rise mt-4 text-4xl leading-tight md:text-6xl" style={{ "--rise-delay": "100ms" } as React.CSSProperties}>
            {d.about.title}
          </h1>
          <p className="rise mt-6 text-lg text-ink-2" style={{ "--rise-delay": "200ms" } as React.CSSProperties}>
            {d.about.lead}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <ol className="space-y-16">
          {d.about.sections.map((s, i) => (
            <Reveal as="li" key={s.title} className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)] md:gap-10">
              <span className="font-display text-5xl text-amber md:text-6xl">0{i + 1}</span>
              <div>
                <h2 className="text-2xl md:text-3xl">{s.title}</h2>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-2 md:text-lg">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <div className="bg-paper-2">
        <Values d={d} />
      </div>
    </>
  );
}
