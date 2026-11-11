import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { PublicProduct } from "@/lib/queries/public";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  locale,
  noImageLabel,
  priority = false,
  className,
}: {
  product: PublicProduct;
  locale: Locale;
  noImageLabel: string;
  priority?: boolean;
  className?: string;
}) {
  const [main, alt] = product.images;
  const name = pickText(product.name, locale);
  const summary = pickText(product.summary, locale);
  const category = product.category ? pickText(product.category.name, locale) : null;

  return (
    <Link
      href={localePath(locale, `/products/${product.slug}`)}
      className={cn("group flex flex-col gap-3 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-moss/40", className)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper-2">
        {main ? (
          <>
            <Image
              src={main.url}
              alt={main.alt ?? name}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className={cn(
                "object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]",
                alt && "group-hover:opacity-0",
              )}
            />
            {alt ? (
              <Image
                src={alt.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            ) : null}
          </>
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-ink-2">{noImageLabel}</div>
        )}
        {product.volume ? (
          <span className="absolute top-3 left-3 rounded-full bg-paper/90 px-2.5 py-1 text-[0.7rem] font-medium tracking-wide text-ink backdrop-blur">
            {product.volume}
          </span>
        ) : null}
      </div>
      <div className="px-1">
        {category ? <p className="text-[0.7rem] font-semibold tracking-[0.12em] text-moss uppercase">{category}</p> : null}
        <h3 className="mt-1 text-lg leading-snug text-ink transition-colors group-hover:text-moss">{name}</h3>
        {summary ? <p className="mt-1 line-clamp-2 text-sm text-ink-2">{summary}</p> : null}
      </div>
    </Link>
  );
}
