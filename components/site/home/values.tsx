import { DropletIcon, FlaskConicalIcon, LeafIcon, MapPinIcon } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import type { PublicDictionary } from "@/lib/i18n/public";

const ICONS = [LeafIcon, FlaskConicalIcon, DropletIcon, MapPinIcon];

/** USP strip under the hero (naturrein · Made in Germany · Expertise · Partner in Taiwan). */
export function Values({ d, withTitle = false }: { d: PublicDictionary; withTitle?: boolean }) {
  const items = [...d.values.items, { title: d.footer.distributor, body: d.footer.distributorBody }];
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
        {withTitle ? <h2 className="section-title mb-10">{d.values.title}</h2> : null}
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal as="li" key={item.title} delay={i * 80} className="flex flex-col items-center text-center">
                <span className="flex size-12 items-center justify-center rounded-full border border-brand text-brand">
                  <Icon className="size-5" strokeWidth={1.5} />
                </span>
                <h3 className="mt-4 text-base text-ink" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>
                  {item.title}
                </h3>
                <p className="mt-1 max-w-[16rem] text-sm leading-relaxed text-ink-2">{item.body}</p>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
