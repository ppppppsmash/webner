import { notFound } from "next/navigation";
import { CategoryTiles } from "@/components/site/home/category-tiles";
import { Hero } from "@/components/site/home/hero";
import { ProductSection } from "@/components/site/home/product-section";
import { ShopBanner } from "@/components/site/home/shop-banner";
import { Story } from "@/components/site/home/story";
import { Values } from "@/components/site/home/values";
import { isLocale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/public";
import {
  getCategoryTree,
  getFeaturedProducts,
  getLatestProducts,
  getPublicSettings,
  getPublishedProducts,
} from "@/lib/queries/public";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);

  const [featured, latest, tree, settings, all] = await Promise.all([
    getFeaturedProducts(4),
    getLatestProducts(8),
    getCategoryTree(),
    getPublicSettings(),
    getPublishedProducts(),
  ]);
  const heroProducts = (featured.length ? featured : all).slice(0, 2);
  const featuredIds = new Set(featured.map((p) => p.id));
  const latestWithoutFeatured = latest.filter((p) => !featuredIds.has(p.id)).slice(0, 4);

  return (
    <>
      <Hero d={d} locale={locale} products={heroProducts} />
      <Story d={d} />
      <CategoryTiles d={d} locale={locale} tree={tree} />
      <ProductSection d={d} locale={locale} title={d.home.featuredTitle} lead={d.home.featuredLead} products={featured} tone="paper-2" />
      <ProductSection d={d} locale={locale} title={d.home.latestTitle} products={latestWithoutFeatured} />
      <Values d={d} />
      {settings.showShopLink && settings.shopUrl ? <ShopBanner d={d} shopUrl={settings.shopUrl} /> : null}
    </>
  );
}
