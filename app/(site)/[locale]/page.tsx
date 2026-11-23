import { notFound } from "next/navigation";
import { CategoryIndex } from "@/components/site/home/category-index";
import { FeaturedShowcase } from "@/components/site/home/featured-showcase";
import { Hero } from "@/components/site/home/hero";
import { LatestScroller } from "@/components/site/home/latest-scroller";
import { ShopBanner } from "@/components/site/home/shop-banner";
import { StoryBand } from "@/components/site/home/story-band";
import { UspRow } from "@/components/site/home/usp-row";
import { isLocale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/public";
import { getCategoryTree, getFeaturedProducts, getLatestProducts, getPublicSettings, getPublishedProducts } from "@/lib/queries/public";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);

  const [featured, latest, tree, settings, all] = await Promise.all([
    getFeaturedProducts(4),
    getLatestProducts(12),
    getCategoryTree(),
    getPublicSettings(),
    getPublishedProducts(),
  ]);
  const featuredIds = new Set(featured.map((p) => p.id));
  const latestWithoutFeatured = latest.filter((p) => !featuredIds.has(p.id)).slice(0, 8);
  // Only a photo uploaded in the management panel is used as a full-bleed hero; otherwise the products are the stage.
  const heroImage = settings.heroImageUrl || null;

  return (
    <>
      <Hero d={d} locale={locale} imageUrl={heroImage} products={all} />
      <UspRow d={d} />
      <FeaturedShowcase d={d} locale={locale} products={featured} />
      {/* The single dark band: everything else stays on white. */}
      <StoryBand d={d} locale={locale} />
      <CategoryIndex d={d} locale={locale} tree={tree} products={all} />
      <LatestScroller d={d} locale={locale} products={latestWithoutFeatured} />
      {settings.showShopLink && settings.shopUrl ? (
        // Pulls the footer up against the band (the footer keeps its top margin for the other pages).
        <div className="-mb-20">
          <ShopBanner d={d} shopUrl={settings.shopUrl} />
        </div>
      ) : null}
    </>
  );
}
