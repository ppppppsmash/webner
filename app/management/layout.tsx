import type { Metadata } from "next";
import { ThemeProvider } from "@/components/management/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { t } from "@/lib/i18n/admin";

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
