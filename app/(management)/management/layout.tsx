import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/management/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { t } from "@/lib/i18n/admin";
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

/** Root layout of the management area (separate from the public site's root layout). */
export default function ManagementLayout({ children }: LayoutProps<"/management">) {
  return (
    <html
      lang="zh-Hant"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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
