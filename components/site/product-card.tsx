import Image from "next/image";
import Link from "next/link";
import { type Locale, pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { PublicProduct } from "@/lib/queries/public";
import { cn } from "@/lib/utils";

/** Shop-style card: square image on white, centred name, category and volume beneath. */
export function ProductCard({
  product,
  locale,
  noImageLabel,
  detailsLabel,
  priority = false,
  className,
}: {
  product: PublicProduct;
  locale: Locale;
  noImageLabel: string;
  detailsLabel?: string;
  priority?: boolean;
  className?: string;
}) {
  const [main, alt] = product.images;
  const name = pickText(product.name, locale);
  const category = product.category ? pickText(product.category.name, locale) : null;

  return (
    <Link
      href={localePath(locale, `/products/${product.slug}`)}
      className={cn(
        "group flex h-full flex-col border border-transparent bg-paper p-3 text-center transition-colors hover:border-line focus-visible:border-brand focus-visible:outline-none",
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
              className={cn("object-cover transition-opacity duration-500", alt && "group-hover:opacity-0")}
            />
            {alt ? (
              <Image
                src={alt.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            ) : null}
          </>
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-ink-2">{noImageLabel}</div>
        )}
        {product.isFeatured ? (
          <span className="absolute top-2 left-2 rounded-full bg-tint px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide text-brand">
            TOP
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col items-center px-1 pt-4 pb-1">
        <h3 className="text-[1.02rem] leading-snug text-ink transition-colors group-hover:text-brand" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
          {name}
        </h3>
        <p className="mt-1 text-xs text-ink-2">{[category, product.volume].filter(Boolean).join(" · ")}</p>
        {detailsLabel ? (
          <span className="mt-3 text-xs font-semibold tracking-wide text-brand uppercase underline-offset-4 group-hover:underline">
            {detailsLabel}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
