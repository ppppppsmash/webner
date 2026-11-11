import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { HTML_LANG, isLocale, LOCALES, type Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import { getDictionary } from "@/lib/i18n/public";
import "@/app/globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
});
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  weight: "variable",
});
const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  preload: false,
});
const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  subsets: ["latin"],
  weight: ["400", "600"],
  preload: false,
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return {
    title: { default: `${d.meta.siteTitle} – ${d.meta.tagline}`, template: `%s | ${d.meta.siteTitle}` },
    description: d.meta.description,
    alternates: {
      languages: Object.fromEntries(LOCALES.map((l) => [HTML_LANG[l], localePath(l)])),
    },
  };
}

export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={HTML_LANG[locale as Locale]}
      className={`${fraunces.variable} ${instrument.variable} ${notoSansTC.variable} ${notoSerifTC.variable} h-full`}
    >
      <body className="site flex min-h-full flex-col">
        <SiteHeader locale={locale} />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
