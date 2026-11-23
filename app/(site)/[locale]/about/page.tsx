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
        <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
          <h1 className="rise text-4xl text-brand md:text-5xl">
            {d.about.title}
          </h1>
          <p className="rise mt-5 text-lg text-ink-2" style={{ "--rise-delay": "100ms" } as React.CSSProperties}>
            {d.about.lead}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        {/* Topics, not steps: title on the left, text on the right, no numbering. */}
        <ul className="divide-y divide-line">
          {d.about.sections.map((s) => (
            <Reveal as="li" key={s.title} className="grid gap-3 py-10 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
              <h2 className="text-2xl text-brand">{s.title}</h2>
              <p className="text-base leading-relaxed text-ink-2">{s.body}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <Values d={d} withTitle />
    </>
  );
}
