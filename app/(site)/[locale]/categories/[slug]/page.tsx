import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogLayout } from "@/components/site/catalog-layout";
import { ProductGrid } from "@/components/site/product-grid";
import { isLocale, pickText } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/public";
import { getCategoryBySlug, getCategoryTree, getProductsByCategory } from "@/lib/queries/public";

export async function generateMetadata({ params }: PageProps<"/[locale]/categories/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return { title: pickText(category.name, locale) };
}

export default async function CategoryPage({ params }: PageProps<"/[locale]/categories/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);

  const [category, tree] = await Promise.all([getCategoryBySlug(slug), getCategoryTree()]);
  if (!category) notFound();
  const products = await getProductsByCategory(
    category.id,
    category.children.map((c) => c.id),
  );

  return (
    <CatalogLayout
      d={d}
      locale={locale}
      tree={tree}
      activeSlug={category.slug}
      title={pickText(category.name, locale)}
      lead={category.parent ? pickText(category.parent.name, locale) : undefined}
      count={products.length}
    >
      <ProductGrid products={products} locale={locale} emptyLabel={d.products.empty} noImageLabel={d.products.noImage} detailsLabel={d.products.details} />
    </CatalogLayout>
  );
}
