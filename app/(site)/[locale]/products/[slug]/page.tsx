import { ProductViewTracker } from "@/components/site/view-tracker";
import { ArrowUpRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/site/product-card";
import { ProductGallery } from "@/components/site/product-gallery";
import { Reveal } from "@/components/site/reveal";
import { VideoEmbed } from "@/components/site/video-embed";
import { isPublicLocale, pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import { getDictionary } from "@/lib/i18n/public";
import { getPublicSettings, getPublishedProductBySlug, getRelatedProducts } from "@/lib/queries/public";
import { sanitizeRichText } from "@/lib/sanitize";

export async function generateMetadata({ params }: PageProps<"/[locale]/products/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPublicLocale(locale)) return {};
  const product = await getPublishedProductBySlug(slug);
  if (!product) return {};
  const image = product.images[0]?.url;
  const title = product.seoTitle[locale] || pickText(product.name, locale);
  const description = product.seoDescription[locale] || pickText(product.summary, locale) || undefined;
  return {
    title,
    description,
    openGraph: { title, description, images: image ? [{ url: image }] : undefined },
    robots: product.visibility === "hidden" ? { index: false, follow: false } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/[locale]/products/[slug]">) {
  const { locale, slug } = await params;
  if (!isPublicLocale(locale)) notFound();
  const d = getDictionary(locale);

  const [product, settings] = await Promise.all([getPublishedProductBySlug(slug), getPublicSettings()]);
  if (!product) notFound();
  const related = await getRelatedProducts(
    product.id,
    product.categories.map((c) => c.categoryId),
    4,
  );

  const name = pickText(product.name, locale);
  const summary = pickText(product.summary, locale);
  const description = pickText(product.description, locale);
  const shopUrl = settings.showShopLink ? product.externalUrl || settings.shopUrl : null;

  // One path (parent › child) per category; the first category is the main one (breadcrumbs).
  const paths = product.categories.map(({ category: c }) =>
    [c.parent ? { slug: c.parent.slug, label: pickText(c.parent.name, locale) } : null, { slug: c.slug, label: pickText(c.name, locale) }].filter(
      (x): x is { slug: string; label: string } => Boolean(x),
    ),
  );
  const crumbs = paths[0] ?? [];

  return (
    <article className="mx-auto max-w-6xl px-6 pt-6 pb-8 md:pt-8">
      <ProductViewTracker productId={product.id} locale={locale} />
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-ink-2">
        <Link href={localePath(locale)} className="py-1 hover:text-brand">
          {d.nav.home}
        </Link>
        <span aria-hidden>/</span>
        <Link href={localePath(locale, "/products")} className="py-1 hover:text-brand">
          {d.products.title}
        </Link>
        {crumbs.map((c) => (
          <span key={c.slug} className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            <Link href={localePath(locale, `/categories/${c.slug}`)} className="py-1 hover:text-brand">
              {c.label}
            </Link>
          </span>
        ))}
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <ProductGallery images={product.images.map((i) => ({ url: i.url, alt: i.alt }))} name={name} noImageLabel={d.products.noImage} />

        <div className="lg:pt-4">
          {/* The category path is already in the breadcrumb above and in the facts below. */}
          {product.badge ? (
            <p className="rise mb-3">
              <span className="bg-brand px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide text-paper uppercase">{d.products.badges[product.badge]}</span>
            </p>
          ) : null}
          <h1 className="rise text-3xl leading-tight text-brand md:text-[2.6rem]" style={{ "--rise-delay": "80ms" } as React.CSSProperties}>
            {name}
          </h1>
          {summary ? (
            <p className="rise mt-4 text-lg text-ink-2" style={{ "--rise-delay": "160ms" } as React.CSSProperties}>
              {summary}
            </p>
          ) : null}

          <dl className="rise mt-6 grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-1 border-y border-line py-4 text-sm" style={{ "--rise-delay": "240ms" } as React.CSSProperties}>
            {product.volume ? (
              <>
                <dt className="text-ink-2">{d.products.volume}</dt>
                <dd className="font-medium">{product.volume}</dd>
              </>
            ) : null}
            {paths.length ? (
              <>
                <dt className="text-ink-2">{d.products.category}</dt>
                <dd className="font-medium">
                  <ul>
                    {paths.map((path) => {
                      const leaf = path[path.length - 1];
                      return (
                        <li key={leaf.slug}>
                          <Link href={localePath(locale, `/categories/${leaf.slug}`)} className="inline-block py-0.5 hover:text-brand">
                            {path.map((c) => c.label).join(" › ")}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </dd>
              </>
            ) : null}
          </dl>

          {shopUrl ? (
            <div className="rise mt-6" style={{ "--rise-delay": "320ms" } as React.CSSProperties}>
              <a href={shopUrl} target="_blank" rel="noreferrer" data-track-shop={product.id} className="btn-primary w-full sm:w-auto">
                {d.products.buyAt}
                <ArrowUpRightIcon className="size-4" />
              </a>
              <p className="mt-2 text-xs text-ink-2">{d.products.buyAtHint}</p>
            </div>
          ) : null}

          {description ? (
            <section className="mt-10">
              <h2 className="footer-title border-b border-line pb-2">{d.products.description}</h2>
              <div className="rich-text" dangerouslySetInnerHTML={{ __html: sanitizeRichText(description) }} />
            </section>
          ) : null}
        </div>
      </div>

      {product.videos.length ? (
        <Reveal as="section" className="mt-20">
          <h2 className="section-title">{d.products.videos}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {product.videos.map((v) => (
              <VideoEmbed key={v.id} kind={v.kind} url={v.url} title={v.title} />
            ))}
          </div>
        </Reveal>
      ) : null}

      {related.length ? (
        <Reveal as="section" className="mt-20">
          <h2 className="section-title">{d.products.related}</h2>
          {/* Flex instead of a grid so fewer than four cards sit centred under the centred heading. */}
          <ul className="-mx-1 mt-8 flex flex-wrap justify-center gap-y-6 md:-mx-2">
            {related.map((p) => (
              <li key={p.id} className="w-1/2 px-1 md:px-2 lg:w-1/4">
                <ProductCard product={p} locale={locale} noImageLabel={d.products.noImage} detailsLabel={d.products.details} />
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}
    </article>
  );
}
