import { ArrowUpRightIcon } from "lucide-react";
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
  const title = product.seoTitle[locale] || pickText(product.name, locale);
  const description = product.seoDescription[locale] || pickText(product.summary, locale) || undefined;
  return {
    title,
    description,
    openGraph: { title, description, images: image ? [{ url: image }] : undefined },
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
    <article className="mx-auto max-w-6xl px-6 pt-6 pb-8 md:pt-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-ink-2">
        <Link href={localePath(locale)} className="hover:text-brand">
          {d.nav.home}
        </Link>
        <span aria-hidden>/</span>
        <Link href={localePath(locale, "/products")} className="hover:text-brand">
          {d.products.title}
        </Link>
        {crumbs.map((c) => (
          <span key={c.slug} className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            <Link href={localePath(locale, `/categories/${c.slug}`)} className="hover:text-brand">
              {c.label}
            </Link>
          </span>
        ))}
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <ProductGallery images={product.images.map((i) => ({ url: i.url, alt: i.alt }))} name={name} noImageLabel={d.products.noImage} />

        <div className="lg:pt-4">
          {product.category ? <p className="rise text-sm text-ink-2">{crumbs.map((c) => c.label).join(" › ")}</p> : null}
          <h1 className="rise mt-2 text-3xl leading-tight text-brand md:text-[2.6rem]" style={{ "--rise-delay": "80ms" } as React.CSSProperties}>
            {name}
          </h1>
          {summary ? (
            <p className="rise mt-4 text-lg text-ink-2" style={{ "--rise-delay": "160ms" } as React.CSSProperties}>
              {summary}
            </p>
          ) : null}

          <dl className="rise mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-y border-line py-4 text-sm" style={{ "--rise-delay": "240ms" } as React.CSSProperties}>
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
            <div className="rise mt-6" style={{ "--rise-delay": "320ms" } as React.CSSProperties}>
              <a href={shopUrl} target="_blank" rel="noreferrer" className="btn-primary w-full sm:w-auto">
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
          <ul className="mt-8 grid grid-cols-2 gap-x-2 gap-y-6 md:gap-x-4 lg:grid-cols-4">
            {related.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} locale={locale} noImageLabel={d.products.noImage} detailsLabel={d.products.details} />
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}
    </article>
  );
}
