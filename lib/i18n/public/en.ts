import type { PublicDictionary } from "./types";

export const en: PublicDictionary = {
  meta: {
    siteTitle: "webner",
    tagline: "Essential oils & natural skincare from Germany",
    description:
      "webner – pure essential oils, hydrosols and natural skincare made in Germany. Explore the collection.",
  },
  nav: {
    home: "Home",
    products: "Products",
    categories: "Categories",
    about: "About webner",
    shop: "Shop",
    menu: "Menu",
    close: "Close",
    language: "Language",
  },
  hero: {
    eyebrow: "Aromatherapy · Aroma care · Natural skincare",
    title: "The power of plants, distilled in Germany.",
    lead: "webner stands for pure essential oils, precious absolutes and nourishing care oils – carefully composed for face, body and senses.",
    ctaProducts: "Explore products",
    ctaStory: "Our story",
  },
  story: {
    eyebrow: "About webner",
    title: "Born from a passion for the scent of nature",
    body: [
      "For decades webner has combined aromatherapy expertise with the rigour of German craftsmanship. Every oil is obtained from carefully selected raw materials and tested for purity.",
      "Rose, jasmine or frankincense – our compositions are made to nurture, to calm and to make everyday life a little more fragrant.",
    ],
  },
  values: {
    title: "What we stand for",
    items: [
      { title: "Pure & natural", body: "100% natural ingredients, no synthetic fragrances." },
      { title: "Made in Germany", body: "Developed and bottled under strict quality standards." },
      { title: "Aromatherapy expertise", body: "Formulas built on decades of experience with essential oils." },
    ],
  },
  home: {
    categoriesTitle: "Categories",
    categoriesLead: "Find your oil – for face, body, home and ritual.",
    featuredTitle: "Recommended",
    featuredLead: "Our favourites from the collection.",
    latestTitle: "New in the collection",
    viewAll: "View all products",
    shopBannerTitle: "Available from our partner in Taiwan",
    shopBannerBody: "All webner products can be ordered from our partner's official online shop.",
    shopBannerCta: "Visit the shop",
  },
  products: {
    title: "Products",
    lead: "The complete webner collection at a glance.",
    all: "All",
    count: (n) => `${n} products`,
    empty: "There are no products in this category yet.",
    filterBy: "By category",
    details: "Details",
    volume: "Size",
    category: "Category",
    buyAt: "View in shop",
    buyAtHint: "Opens our partner's online shop in a new tab.",
    related: "You may also like",
    backToList: "Back to all products",
    videos: "Videos",
    description: "Description",
    noImage: "No image",
    searchResults: (n, q) => `${n} results for “${q}”`,
    searchPlaceholder: "Search products …",
  },
  about: {
    title: "About webner",
    lead: "Pure essential oils and natural skincare – carefully made in Germany.",
    sections: [
      {
        title: "Our origins",
        body: "webner grew from the conviction that the power of plants works best when it is left unaltered. Purity, transparency and craftsmanship have been at the centre from the very beginning.",
      },
      {
        title: "Our raw materials",
        body: "We source from partners we know and trust. Every batch is tested before it becomes a webner product.",
      },
      {
        title: "Our philosophy",
        body: "To us, aromatherapy is mindfulness in practice: one drop, one breath, one moment for yourself.",
      },
    ],
  },
  footer: {
    about: "webner – essential oils & natural skincare from Germany.",
    categories: "Categories",
    links: "More",
    distributor: "Official partner in Taiwan",
    distributorBody: "久保雅司國際股份有限公司 · Taipei",
    rights: "All rights reserved.",
    management: "Management",
  },
  notFound: {
    title: "Page not found",
    body: "The page you are looking for does not exist or has moved.",
    cta: "Back to home",
  },
};
