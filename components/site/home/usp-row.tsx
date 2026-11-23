import type { PublicDictionary } from "@/lib/i18n/public";

/** The four brand facts as one ruled text row — no icons, the words carry it. */
export function UspRow({ d }: { d: PublicDictionary }) {
  const items = [...d.values.items, { title: d.footer.distributor, body: d.footer.distributorBody }];
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4 lg:gap-x-10">
        {items.map((item) => (
          <div key={item.title} className="border-t border-brand pt-4">
            <dt className="font-display text-lg leading-snug text-brand">{item.title}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-ink-2">{item.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
