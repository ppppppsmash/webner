import type { ProductBadge } from "@/lib/product-badges";
export interface PublicDictionary {
  meta: {
    siteTitle: string;
    tagline: string;
    description: string;
  };
  nav: {
    home: string;
    products: string;
    categories: string;
    about: string;
    shop: string;
    menu: string;
    close: string;
    language: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    ctaProducts: string;
    ctaStory: string;
  };
  story: {
    eyebrow: string;
    title: string;
    body: string[];
  };
  values: {
    title: string;
    items: { title: string; body: string }[];
  };
  home: {
    categoriesTitle: string;
    categoriesLead: string;
    featuredTitle: string;
    featuredLead: string;
    latestTitle: string;
    viewAll: string;
    shopBannerTitle: string;
    shopBannerBody: string;
    shopBannerCta: string;
  };
  products: {
    title: string;
    lead: string;
    all: string;
    count: (n: number) => string;
    empty: string;
    filterBy: string;
    details: string;
    volume: string;
    category: string;
    buyAt: string;
    buyAtHint: string;
    related: string;
    backToList: string;
    videos: string;
    description: string;
    noImage: string;
    badges: Record<ProductBadge, string>;
    searchResults: (n: number, q: string) => string;
    searchPlaceholder: string;
  };
  about: {
    title: string;
    lead: string;
    sections: { title: string; body: string }[];
  };
  footer: {
    about: string;
    categories: string;
    links: string;
    distributor: string;
    distributorBody: string;
    rights: string;
    management: string;
  };
  notFound: {
    title: string;
    body: string;
    cta: string;
  };
}
