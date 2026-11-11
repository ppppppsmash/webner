import type { Metadata } from "next";
import { ThemeProvider } from "@/components/management/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { t } from "@/lib/i18n/admin";

/**
 * The management area is an internal tool: pages read the database at request
 * time and stream in behind `loading.tsx`. Opt out of instant-navigation
 * validation here; the public gallery is validated separately.
 */
export const instant = false;

export const metadata: Metadata = {
  title: {
    default: t.app.name,
    template: `%s | ${t.app.name}`,
  },
  robots: { index: false, follow: false },
};

export default function ManagementLayout({ children }: LayoutProps<"/management">) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <div lang="zh-Hant" className="flex min-h-screen flex-1 flex-col">
          {children}
        </div>
        <Toaster position="top-center" richColors />
      </TooltipProvider>
    </ThemeProvider>
  );
}
