import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/management/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { t } from "@/lib/i18n/admin";
import { getSiteSettings } from "@/lib/settings";
import "@/app/globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: t.app.name,
    template: `%s | ${t.app.name}`,
  },
  robots: { index: false, follow: false },
};

/**
 * Same tab icon as the public site (設定 → 網站圖示). Rendered as <link> elements, which React moves into <head>.
 * The setting is read straight from the database, not through the cached getPublicSettings(): with the cached
 * read (in generateMetadata or here) Next.js reported "new Date() while prerendering" for the session lookup
 * in the sidebar on the navigation that follows every saved setting.
 */
async function SiteIconLinks() {
  const { faviconUrl } = await getSiteSettings();
  if (faviconUrl) {
    return (
      <>
        <link rel="icon" href={faviconUrl} />
        <link rel="apple-touch-icon" href={faviconUrl} />
      </>
    );
  }
  return (
    <>
      <link rel="icon" href="/favicon.ico" sizes="48x48" type="image/x-icon" />
      <link rel="icon" href="/icon.png" sizes="512x512" type="image/png" />
      <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" type="image/png" />
    </>
  );
}

/** Root layout of the management area (separate from the public site's root layout). */
export default function ManagementLayout({ children }: LayoutProps<"/management">) {
  return (
    <html
      lang="zh-Hant"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <SiteIconLinks />
        </Suspense>
        <ThemeProvider>
          <TooltipProvider>
            <div className="flex min-h-screen flex-1 flex-col">{children}</div>
            <Toaster position="top-center" richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
