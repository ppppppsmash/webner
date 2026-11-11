import { DropletIcon, FlaskConicalIcon, LeafIcon } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import type { PublicDictionary } from "@/lib/i18n/public";

const ICONS = [LeafIcon, FlaskConicalIcon, DropletIcon];

export function Values({ d }: { d: PublicDictionary }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <Reveal>
        <h2 className="text-center text-3xl md:text-4xl">{d.values.title}</h2>
      </Reveal>
      <ul className="mt-12 grid gap-10 md:grid-cols-3">
        {d.values.items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <Reveal as="li" key={item.title} delay={i * 100} className="flex flex-col items-center text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-sage text-moss">
                <Icon className="size-6" strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 text-xl">{item.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-2">{item.body}</p>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
