import type { PublicDictionary } from "./types";

export const de: PublicDictionary = {
  meta: {
    siteTitle: "webner",
    tagline: "Ätherische Öle & Naturkosmetik aus Deutschland",
    description:
      "webner – naturreine ätherische Öle, Pflanzenwässer und Naturkosmetik aus Deutschland. Entdecken Sie die Kollektion.",
  },
  nav: {
    home: "Start",
    products: "Produkte",
    categories: "Kategorien",
    about: "Über webner",
    shop: "Zum Shop",
    menu: "Menü",
    close: "Schließen",
    language: "Sprache",
  },
  hero: {
    eyebrow: "Aromatherapie · Aromapflege · Naturkosmetik",
    title: "Die Kraft der Pflanze, destilliert in Deutschland.",
    lead: "webner steht für naturreine ätherische Öle, kostbare Absolues und Pflegeöle – sorgfältig komponiert für Gesicht, Körper und Sinne.",
    ctaProducts: "Produkte entdecken",
    ctaStory: "Unsere Geschichte",
  },
  story: {
    eyebrow: "Über webner",
    title: "Aus Leidenschaft für den Duft der Natur",
    body: [
      "Seit Jahrzehnten verbindet webner die Erfahrung der Aromatherapie mit dem Anspruch deutscher Qualitätsarbeit. Jedes Öl wird aus sorgfältig ausgewählten Rohstoffen gewonnen und auf Reinheit geprüft.",
      "Ob Rose, Jasmin oder Weihrauch – unsere Kompositionen sollen pflegen, beruhigen und den Alltag ein wenig duftender machen.",
    ],
  },
  values: {
    title: "Wofür wir stehen",
    items: [
      { title: "Naturrein", body: "100 % natürliche Inhaltsstoffe, keine synthetischen Duftstoffe." },
      { title: "Hergestellt in Deutschland", body: "Entwickelt und abgefüllt nach strengen Qualitätsstandards." },
      { title: "Aromatherapie-Expertise", body: "Rezepturen, die auf langjähriger Erfahrung mit ätherischen Ölen beruhen." },
    ],
  },
  home: {
    categoriesTitle: "Kategorien",
    categoriesLead: "Finden Sie Ihr Öl – für Gesicht, Körper, Raum und Ritual.",
    featuredTitle: "Empfehlungen",
    featuredLead: "Unsere Lieblinge aus der Kollektion.",
    latestTitle: "Neu in der Kollektion",
    viewAll: "Alle Produkte ansehen",
    shopBannerTitle: "Erhältlich bei unserem Partner in Taiwan",
    shopBannerBody: "Alle webner-Produkte können Sie im offiziellen Online-Shop unseres Partners bestellen.",
    shopBannerCta: "Zum Shop",
  },
  products: {
    title: "Produkte",
    lead: "Die gesamte webner-Kollektion auf einen Blick.",
    all: "Alle",
    count: (n) => `${n} Produkte`,
    empty: "In dieser Kategorie gibt es noch keine Produkte.",
    filterBy: "Nach Kategorie",
    details: "Details",
    volume: "Inhalt",
    category: "Kategorie",
    buyAt: "Im Shop ansehen",
    buyAtHint: "Öffnet den Online-Shop unseres Partners in einem neuen Tab.",
    related: "Das könnte Ihnen auch gefallen",
    backToList: "Zurück zur Übersicht",
    videos: "Videos",
    description: "Beschreibung",
    noImage: "Kein Bild",
    searchResults: (n, q) => `${n} Treffer für „${q}“`,
    searchPlaceholder: "Produkte suchen …",
  },
  about: {
    title: "Über webner",
    lead: "Naturreine ätherische Öle und Naturkosmetik – mit Sorgfalt in Deutschland hergestellt.",
    sections: [
      {
        title: "Unsere Herkunft",
        body: "webner entstand aus der Überzeugung, dass die Kraft der Pflanzen am besten wirkt, wenn sie unverfälscht bleibt. Seit den Anfängen stehen Reinheit, Transparenz und handwerkliche Sorgfalt im Mittelpunkt.",
      },
      {
        title: "Unsere Rohstoffe",
        body: "Wir beziehen unsere Rohstoffe von Partnern, die wir kennen und denen wir vertrauen. Jede Charge wird geprüft, bevor sie zu einem webner-Produkt wird.",
      },
      {
        title: "Unsere Philosophie",
        body: "Aromatherapie ist für uns gelebte Achtsamkeit: ein Tropfen, ein Atemzug, ein Moment für sich selbst.",
      },
    ],
  },
  footer: {
    about: "webner – ätherische Öle & Naturkosmetik aus Deutschland.",
    categories: "Kategorien",
    links: "Mehr",
    distributor: "Offizieller Partner in Taiwan",
    distributorBody: "久保雅司國際股份有限公司 · Taipei",
    rights: "Alle Rechte vorbehalten.",
    management: "Verwaltung",
  },
  notFound: {
    title: "Seite nicht gefunden",
    body: "Die gesuchte Seite existiert nicht oder wurde verschoben.",
    cta: "Zur Startseite",
  },
};
