import { DropletIcon, FlaskConicalIcon, LeafIcon, MapPinIcon } from "lucide-react";
import type { PublicDictionary } from "@/lib/i18n/public";

const ICONS = [LeafIcon, FlaskConicalIcon, DropletIcon, MapPinIcon];

/**
 * USP strip under the hero (naturrein · Made in Germany · Expertise · Partner in Taiwan).
 * Static on purpose: it is the first thing below the hero and should simply be there.
 */
export function Values({ d, withTitle = false }: { d: PublicDictionary; withTitle?: boolean }) {
  const items = [...d.values.items, { title: d.footer.distributor, body: d.footer.distributorBody }];
  return (
    <section className={withTitle ? "border-t border-line pb-10 md:pb-16" : "border-b border-line"}>
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-14">
        {withTitle ? <h2 className="section-title mb-10">{d.values.title}</h2> : null}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <li key={item.title} className="flex flex-col items-center text-center">
                <span className="flex size-12 items-center justify-center rounded-full border border-brand text-brand">
                  <Icon className="size-5" strokeWidth={1.5} />
                </span>
                <h3 className="mt-4 text-base text-ink" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>
                  {item.title}
                </h3>
                <p className="mt-1 max-w-[16rem] text-sm leading-relaxed text-ink-2">{item.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
