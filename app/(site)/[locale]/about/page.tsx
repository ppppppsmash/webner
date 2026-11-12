import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Values } from "@/components/site/home/values";
import { Reveal } from "@/components/site/reveal";
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
      <section className="bg-tint-soft">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
          <p className="eyebrow rise">{d.story.eyebrow}</p>
          <h1 className="rise mt-3 text-4xl text-brand md:text-5xl" style={{ "--rise-delay": "100ms" } as React.CSSProperties}>
            {d.about.title}
          </h1>
          <p className="rise mt-5 text-lg text-ink-2" style={{ "--rise-delay": "200ms" } as React.CSSProperties}>
            {d.about.lead}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        <ol className="divide-y divide-line">
          {d.about.sections.map((s, i) => (
            <Reveal as="li" key={s.title} className="grid gap-3 py-10 first:pt-0 md:grid-cols-[100px_minmax(0,1fr)] md:gap-8">
              <span className="font-display text-4xl text-tint md:text-5xl">0{i + 1}</span>
              <div>
                <h2 className="text-2xl text-brand">{s.title}</h2>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-2">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <Values d={d} withTitle />
    </>
  );
}
