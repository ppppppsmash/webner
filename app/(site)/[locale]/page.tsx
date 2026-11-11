import { isLocale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/public";
import { notFound } from "next/navigation";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <p className="eyebrow">{d.hero.eyebrow}</p>
      <h1 className="mt-4 max-w-3xl text-5xl leading-[1.05] md:text-6xl">{d.hero.title}</h1>
      <p className="mt-6 max-w-xl text-lg text-ink-2">{d.hero.lead}</p>
    </section>
  );
}
