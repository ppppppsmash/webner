import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogLayout } from "@/components/site/catalog-layout";
import { ProductGrid } from "@/components/site/product-grid";
import { ProductSearchGrid } from "@/components/site/product-search-grid";
import { isLocale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/public";
import { getCategoryTree, getPublishedProducts } from "@/lib/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/products">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return { title: d.products.title, description: d.products.lead };
}

export default async function ProductsPage({ params }: PageProps<"/[locale]/products">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  const [products, tree] = await Promise.all([getPublishedProducts(), getCategoryTree()]);

  return (
    <CatalogLayout d={d} locale={locale} tree={tree} activeSlug={null} title={d.products.title} count={products.length}>
      <Suspense fallback={<ProductGrid products={products} locale={locale} emptyLabel={d.products.empty} noImageLabel={d.products.noImage} detailsLabel={d.products.details} />}>
        <ProductSearchGrid
          products={products}
          locale={locale}
          emptyLabel={d.products.empty}
          noImageLabel={d.products.noImage}
          detailsLabel={d.products.details}
        />
      </Suspense>
    </CatalogLayout>
  );
}
