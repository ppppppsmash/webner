import Link from "next/link";
import { getDictionary } from "@/lib/i18n/public";

/** Rendered inside the locale layout; falls back to German when the segment is unknown. */
export default function SiteNotFound() {
  const d = getDictionary("de");
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-32 text-center">
      <p className="font-display text-7xl text-moss">404</p>
      <h1 className="text-3xl">{d.notFound.title}</h1>
      <p className="text-ink-2">{d.notFound.body}</p>
      <Link href="/de" className="btn-primary mt-4">
        {d.notFound.cta}
      </Link>
    </section>
  );
}
