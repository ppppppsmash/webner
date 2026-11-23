import Image from "next/image";
import Link from "next/link";
import { type Locale, pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import { getDictionary } from "@/lib/i18n/public";
import type { PublicProduct } from "@/lib/queries/public";
import { cn } from "@/lib/utils";

/** Shop-style card: a square photo, then the centred name with category and volume. The whole card is the link. */
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
  const mainCategory = product.categories[0]?.category;
  const category = mainCategory ? pickText(mainCategory.name, locale) : null;
  const badge = product.badge ? getDictionary(locale).products.badges[product.badge] : null;

  return (
    <Link
      href={localePath(locale, `/products/${product.slug}`)}
      className={cn(
        "group flex h-full flex-col text-center",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-paper-2">
        {main ? (
          <>
            <Image
              src={main.url}
              alt={main.alt ?? name}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className={cn("object-cover transition-[opacity,scale] duration-300 ease-out", alt ? "group-hover:opacity-0" : "group-hover:scale-[1.03]")}
            />
            {alt ? (
              <Image
                src={alt.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
              />
            ) : null}
          </>
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-ink-2">{noImageLabel}</div>
        )}
        {badge ? (
          <span className="absolute top-2 left-2 bg-brand px-2.5 py-1 text-xs font-semibold tracking-wider text-paper uppercase">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col items-center px-1 pt-4">
        <h3 className="text-base leading-snug text-ink underline-offset-4 group-hover:text-brand group-hover:underline" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
          {name}
        </h3>
        <p className="tabular mt-1.5 text-sm text-ink-2">{[category, product.volume].filter(Boolean).join(" · ")}</p>
      </div>
    </Link>
  );
}
