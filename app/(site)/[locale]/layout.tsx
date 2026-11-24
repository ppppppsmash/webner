import type { Metadata } from "next";
import { Libre_Franklin, Lora, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ViewTracker } from "@/components/site/view-tracker";
import { HTML_LANG, isPublicLocale, PUBLIC_LOCALES, type Locale } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import { getDictionary } from "@/lib/i18n/public";
import { getPublicSettings } from "@/lib/queries/public";
import { siteIcons } from "@/lib/site-icons";
import { siteThemeCss } from "@/lib/site-themes";
import "@/app/globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  style: ["normal", "italic"],
});
const franklin = Libre_Franklin({
  variable: "--font-franklin",
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
  return PUBLIC_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublicLocale(locale)) return {};
  const d = getDictionary(locale);
  // The name set in the management panel (設定 → 網站名稱).
  const { siteName, faviconUrl } = await getPublicSettings();
  return {
    title: { default: `${siteName} – ${d.meta.tagline}`, template: `%s | ${siteName}` },
    description: d.meta.description,
    icons: siteIcons(faviconUrl),
    alternates: {
      languages: Object.fromEntries(PUBLIC_LOCALES.map((l) => [HTML_LANG[l], localePath(l)])),
    },
  };
}

export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isPublicLocale(locale)) notFound();
  const { siteTheme } = await getPublicSettings();
  const themeCss = siteThemeCss(siteTheme);

  return (
    <html
      lang={HTML_LANG[locale as Locale]}
      className={`${lora.variable} ${franklin.variable} ${notoSansTC.variable} ${notoSerifTC.variable} h-full`}
      data-theme={siteTheme}
    >
      <body className="site flex min-h-full flex-col">
        {/* Colour theme chosen in the management panel; nothing is rendered for the default one (its colours are in globals.css). */}
        {themeCss ? <style dangerouslySetInnerHTML={{ __html: themeCss }} /> : null}
        {/* Visit counter for the management dashboard (no cookie, nothing about the visitor is stored). */}
        <Suspense fallback={null}>
          <ViewTracker locale={locale} />
        </Suspense>
        <SiteHeader locale={locale} />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
