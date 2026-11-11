import { ArrowUpRightIcon, ChevronLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/site/product-card";
import { ProductGallery } from "@/components/site/product-gallery";
import { Reveal } from "@/components/site/reveal";
import { VideoEmbed } from "@/components/site/video-embed";
import { isLocale, pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import { getDictionary } from "@/lib/i18n/public";
import { getPublicSettings, getPublishedProductBySlug, getRelatedProducts } from "@/lib/queries/public";
import { sanitizeRichText } from "@/lib/sanitize";

export async function generateMetadata({ params }: PageProps<"/[locale]/products/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = await getPublishedProductBySlug(slug);
  if (!product) return {};
  const image = product.images[0]?.url;
  return {
    title: pickText(product.name, locale),
    description: pickText(product.summary, locale) || undefined,
    openGraph: image ? { images: [{ url: image }] } : undefined,
  };
}

export default async function ProductPage({ params }: PageProps<"/[locale]/products/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);

  const [product, settings] = await Promise.all([getPublishedProductBySlug(slug), getPublicSettings()]);
  if (!product) notFound();
  const related = await getRelatedProducts(product.id, product.categoryId, 4);

  const name = pickText(product.name, locale);
  const summary = pickText(product.summary, locale);
  const description = pickText(product.description, locale);
  const shopUrl = settings.showShopLink ? product.externalUrl || settings.shopUrl : null;

  const crumbs = [
    product.category?.parent ? { slug: product.category.parent.slug, label: pickText(product.category.parent.name, locale) } : null,
    product.category ? { slug: product.category.slug, label: pickText(product.category.name, locale) } : null,
  ].filter((c): c is { slug: string; label: string } => Boolean(c));

  return (
    <article className="mx-auto max-w-6xl px-6 pt-8 pb-8 md:pt-12">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-ink-2">
        <Link href={localePath(locale, "/products")} className="inline-flex items-center gap-1 hover:text-moss">
          <ChevronLeftIcon className="size-3.5" />
          {d.products.title}
        </Link>
        {crumbs.map((c) => (
          <span key={c.slug} className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            <Link href={localePath(locale, `/categories/${c.slug}`)} className="hover:text-moss">
              {c.label}
            </Link>
          </span>
        ))}
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <ProductGallery images={product.images.map((i) => ({ url: i.url, alt: i.alt }))} name={name} noImageLabel={d.products.noImage} />

        <div className="lg:pt-6">
          {product.category ? (
            <p className="eyebrow rise">{pickText(product.category.name, locale)}</p>
          ) : null}
          <h1 className="rise mt-3 text-4xl leading-tight md:text-5xl" style={{ "--rise-delay": "80ms" } as React.CSSProperties}>
            {name}
          </h1>
          {summary ? (
            <p className="rise mt-4 text-lg text-ink-2" style={{ "--rise-delay": "160ms" } as React.CSSProperties}>
              {summary}
            </p>
          ) : null}

          <dl className="rise mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-y border-line py-4 text-sm" style={{ "--rise-delay": "240ms" } as React.CSSProperties}>
            {product.volume ? (
              <>
                <dt className="text-ink-2">{d.products.volume}</dt>
                <dd className="font-medium">{product.volume}</dd>
              </>
            ) : null}
            {product.category ? (
              <>
                <dt className="text-ink-2">{d.products.category}</dt>
                <dd className="font-medium">{crumbs.map((c) => c.label).join(" › ")}</dd>
              </>
            ) : null}
          </dl>

          {shopUrl ? (
            <div className="rise mt-8" style={{ "--rise-delay": "320ms" } as React.CSSProperties}>
              <a href={shopUrl} target="_blank" rel="noreferrer" className="btn-primary">
                {d.products.buyAt}
                <ArrowUpRightIcon className="size-4" />
              </a>
              <p className="mt-2 text-xs text-ink-2">{d.products.buyAtHint}</p>
            </div>
          ) : null}

          {description ? (
            <section className="mt-10">
              <h2 className="footer-title">{d.products.description}</h2>
              <div className="rich-text" dangerouslySetInnerHTML={{ __html: sanitizeRichText(description) }} />
            </section>
          ) : null}
        </div>
      </div>

      {product.videos.length ? (
        <Reveal as="section" className="mt-20">
          <h2 className="text-2xl md:text-3xl">{d.products.videos}</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {product.videos.map((v) => (
              <VideoEmbed key={v.id} kind={v.kind} url={v.url} title={v.title} />
            ))}
          </div>
        </Reveal>
      ) : null}

      {related.length ? (
        <Reveal as="section" className="mt-24">
          <h2 className="text-2xl md:text-3xl">{d.products.related}</h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} locale={locale} noImageLabel={d.products.noImage} />
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}
    </article>
  );
}
