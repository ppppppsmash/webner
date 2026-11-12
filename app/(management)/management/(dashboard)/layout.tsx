import { Suspense } from "react";
import { AppHeader } from "@/components/management/app-header";
import { AppSidebar } from "@/components/management/app-sidebar";
import { SidebarUser } from "@/components/management/sidebar-user";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({ children }: LayoutProps<"/management">) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 68)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        userSlot={
          <Suspense fallback={<Skeleton className="h-12 w-full rounded-lg" />}>
            <SidebarUser />
          </Suspense>
        }
      />
      <SidebarInset className="min-h-0">
        <AppHeader />
        <div className="flex flex-1 flex-col">
          <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-6 lg:px-6">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
